-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "navigationOrder" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- Seed the fixed top-level editorial sections before making the relation required.
INSERT INTO "Section" (
    "id",
    "name",
    "slug",
    "navigationOrder",
    "isVisible",
    "updatedAt"
) VALUES
    ('00000000-0000-4000-8000-000000000001', 'EVENTS', 'events', 1, true, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000002', 'LOCATIONS', 'locations', 2, true, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000003', 'MODE', 'mode', 3, true, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000004', 'KULTUR', 'kultur', 4, true, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000005', 'INTERVIEWS', 'interviews', 5, true, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000006', 'NEWS', 'news', 6, true, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "sectionId" TEXT;

-- Preserve useful classification for existing content and place everything else in NEWS.
WITH article_section_mapping AS (
    SELECT
        article."id" AS "articleId",
        CASE
            WHEN category."slug" = 'events' THEN 'events'
            WHEN category."slug" = 'kultur' THEN 'kultur'
            WHEN category."slug" = 'interviews' THEN 'interviews'
            ELSE 'news'
        END AS "sectionSlug"
    FROM "Article" AS article
    LEFT JOIN "Category" AS category
        ON category."id" = article."categoryId"
)
UPDATE "Article" AS article
SET "sectionId" = section."id"
FROM article_section_mapping AS mapping
JOIN "Section" AS section
    ON section."slug" = mapping."sectionSlug"
WHERE article."id" = mapping."articleId";

ALTER TABLE "Article" ALTER COLUMN "sectionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Section_isVisible_navigationOrder_idx" ON "Section"("isVisible", "navigationOrder");

-- CreateIndex
CREATE INDEX "Article_sectionId_idx" ON "Article"("sectionId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
