CREATE TABLE "PublicSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "categoriesEnabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PublicSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PublicSettings_singleton" CHECK ("id" = 'site')
);
INSERT INTO "PublicSettings" ("id", "categoriesEnabled") VALUES ('site', true);
