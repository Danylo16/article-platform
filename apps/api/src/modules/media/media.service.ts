import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? resolve(__dirname, "../../../uploads"));

const EXTENSIONS_BY_MIME_TYPE: Record<string, readonly string[]> = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

type MediaStorageDriver = "local" | "s3";
type S3Configuration = {
  bucket: string;
  publicUrl: string;
  client: S3Client;
};

let cachedS3Configuration: S3Configuration | null = null;

export class MediaStorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaStorageConfigurationError";
  }
}

function getStorageDriver(): MediaStorageDriver {
  const value = (process.env.MEDIA_STORAGE_DRIVER ?? "local")
    .trim()
    .toLowerCase();

  if (value === "local" || value === "s3") {
    return value;
  }

  throw new MediaStorageConfigurationError(
    "MEDIA_STORAGE_DRIVER must be either local or s3",
  );
}

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new MediaStorageConfigurationError(`${name} is required`);
  }

  return value;
}

function getS3Configuration(): S3Configuration {
  if (cachedS3Configuration) {
    return cachedS3Configuration;
  }

  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();

  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new MediaStorageConfigurationError(
      "S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set together",
    );
  }

  cachedS3Configuration = {
    bucket: requireEnvironmentVariable("S3_BUCKET"),
    publicUrl: requireEnvironmentVariable("S3_PUBLIC_URL").replace(
      /\/+$/,
      "",
    ),
    client: new S3Client({
      region: requireEnvironmentVariable("S3_REGION"),
      endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    }),
  };

  return cachedS3Configuration;
}

function createObjectKey(fileName: string) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `media/${year}/${month}/${fileName}`;
}

function createPublicUrl(baseUrl: string, objectKey: string) {
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

function validateImage(fileName: string, mimeType: string) {
  const allowedExtensions = EXTENSIONS_BY_MIME_TYPE[mimeType];

  if (!allowedExtensions) {
    throw new Error("UNSUPPORTED_MEDIA_TYPE");
  }

  const extension = extname(fileName).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    throw new Error("INVALID_FILE_EXTENSION");
  }

  return extension;
}

async function saveLocally(fileName: string, buffer: Buffer) {
  await mkdir(UPLOAD_DIR, {
    recursive: true,
  });

  await writeFile(resolve(UPLOAD_DIR, fileName), buffer);

  return {
    fileName,
    url: `/uploads/${fileName}`,
  };
}

async function saveToS3(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
) {
  const { bucket, client, publicUrl } = getS3Configuration();
  const objectKey = createObjectKey(fileName);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    fileName,
    url: createPublicUrl(publicUrl, objectKey),
  };
}

export async function saveImage(
  originalFileName: string,
  mimeType: string,
  buffer: Buffer,
) {
  const extension = validateImage(originalFileName, mimeType);
  const generatedName = `${randomUUID()}${extension}`;

  if (getStorageDriver() === "s3") {
    return saveToS3(generatedName, mimeType, buffer);
  }

  return saveLocally(generatedName, buffer);
}
