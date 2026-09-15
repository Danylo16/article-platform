import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = resolve(__dirname, "../../../uploads");
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
export async function saveImage(fileName, mimeType, buffer) {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error("UNSUPPORTED_MEDIA_TYPE");
    }
    const extension = extname(fileName).toLowerCase();
    const safeExtension = extension === ".jpeg" ||
        extension === ".jpg" ||
        extension === ".png" ||
        extension === ".webp"
        ? extension
        : "";
    if (!safeExtension) {
        throw new Error("INVALID_FILE_EXTENSION");
    }
    await mkdir(UPLOAD_DIR, {
        recursive: true,
    });
    const generatedName = `${randomUUID()}${safeExtension}`;
    const filePath = resolve(UPLOAD_DIR, generatedName);
    await writeFile(filePath, buffer);
    return {
        fileName: generatedName,
        url: `/uploads/${generatedName}`,
    };
}
//# sourceMappingURL=media.service.js.map