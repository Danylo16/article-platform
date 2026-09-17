import argon2 from "argon2";

import { prisma } from "../src/lib/prisma.js";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  const email = requireEnv("ADMIN_BOOTSTRAP_EMAIL")
    .trim()
    .toLowerCase();

  const password = requireEnv(
    "ADMIN_BOOTSTRAP_PASSWORD",
  );

  if (password.length < 15) {
    throw new Error(
      "Admin password must be at least 15 characters",
    );
  }

  if (password.length > 128) {
    throw new Error(
      "Admin password must be at most 128 characters",
    );
  }

  const existing =
    await prisma.adminUser.findUnique({
      where: {
        email,
      },
    });

  if (existing) {
    throw new Error(
      `Admin already exists: ${email}`,
    );
  }

  const passwordHash = await argon2.hash(
    password,
    {
      type: argon2.argon2id,
      memoryCost: 64 * 1024,
      timeCost: 3,
      parallelism: 1,
    },
  );

  const admin =
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
      },

      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

  console.log("Admin created:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });