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
  const email = requireEnv("ADMIN_EMAIL")
    .trim()
    .toLowerCase();

  const password = requireEnv("ADMIN_NEW_PASSWORD");

  if (password.length < 15) {
    throw new Error(
      "Password must be at least 15 characters",
    );
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024,
    timeCost: 3,
    parallelism: 1,
  });

  const admin = await prisma.adminUser.update({
    where: { email },
    data: { passwordHash },
    select: {
      id: true,
      email: true,
    },
  });

  // Kill all existing sessions after password reset.
  await prisma.adminSession.deleteMany({
    where: {
      userId: admin.id,
    },
  });

  console.log("Password reset for:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });