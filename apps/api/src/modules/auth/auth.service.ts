import crypto from "node:crypto";
import argon2 from "argon2";

import { prisma } from "../../lib/prisma.js";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_ACTIVE_SESSIONS = 5;

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 1,
} as const;

export const ADMIN_SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-admin_session"
    : "admin_session";

export const ADMIN_SESSION_MAX_AGE_SECONDS =
  SESSION_TTL_MS / 1000;

export type AuthenticatedAdmin = {
  id: string;
  email: string;
};

const DUMMY_PASSWORD_HASH = await argon2.hash(
  crypto.randomBytes(32).toString("hex"),
  ARGON2_OPTIONS,
);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function hashAdminPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedAdmin | null> {
  const normalizedEmail = normalizeEmail(email);

  const admin = await prisma.adminUser.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    await argon2.verify(
      DUMMY_PASSWORD_HASH,
      password,
    );

    return null;
  }

  const passwordValid = await argon2.verify(
    admin.passwordHash,
    password,
  );

  if (!passwordValid || !admin.isActive) {
    return null;
  }

  if (
    argon2.needsRehash(
      admin.passwordHash,
      ARGON2_OPTIONS,
    )
  ) {
    const passwordHash =
      await hashAdminPassword(password);

    await prisma.adminUser.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash,
      },
    });
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}

export async function createAdminSession(
  userId: string,
) {
  const token = crypto
    .randomBytes(32)
    .toString("base64url");

  const tokenHash = hashSessionToken(token);

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + SESSION_TTL_MS,
  );

  await prisma.$transaction(async (tx) => {
    await tx.adminSession.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lte: now,
            },
          },
          {
            revokedAt: {
              not: null,
            },
          },
        ],
      },
    });

    await tx.adminSession.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    const excessSessions =
      await tx.adminSession.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip: MAX_ACTIVE_SESSIONS,

        select: {
          id: true,
        },
      });

    if (excessSessions.length > 0) {
      await tx.adminSession.deleteMany({
        where: {
          id: {
            in: excessSessions.map(
              (session) => session.id,
            ),
          },
        },
      });
    }

    await tx.adminUser.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: now,
      },
    });
  });

  return {
    token,
    expiresAt,
  };
}

export async function getAdminFromSessionToken(
  token: string,
): Promise<AuthenticatedAdmin | null> {
  const tokenHash = hashSessionToken(token);

  const session =
    await prisma.adminSession.findUnique({
      where: {
        tokenHash,
      },
      select: {
        expiresAt: true,
        revokedAt: true,

        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

  if (!session) {
    return null;
  }

  if (
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    !session.user.isActive
  ) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
}

export async function revokeAdminSession(
  token: string,
) {
  const tokenHash = hashSessionToken(token);

  await prisma.adminSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}