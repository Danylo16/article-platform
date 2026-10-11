-- Create editable location types. Every statement is safe when the previous
-- Google Maps draft migration was already applied locally.
CREATE TABLE IF NOT EXISTS "LocationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "navigationOrder" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LocationType_slug_key"
ON "LocationType"("slug");

INSERT INTO "LocationType" (
    "id",
    "name",
    "slug",
    "icon",
    "navigationOrder",
    "isVisible",
    "updatedAt"
)
VALUES
    ('location-type-cafe', 'Cafés', 'cafes', 'coffee', 1, true, CURRENT_TIMESTAMP),
    ('location-type-restaurant', 'Restaurants', 'restaurants', 'restaurant', 2, true, CURRENT_TIMESTAMP),
    ('location-type-entertainment', 'Freizeit', 'freizeit', 'music', 3, true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "typeId" TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Place'
          AND column_name = 'type'
    ) THEN
        UPDATE "Place"
        SET "typeId" = CASE "type"::text
            WHEN 'CAFE' THEN 'location-type-cafe'
            WHEN 'RESTAURANT' THEN 'location-type-restaurant'
            WHEN 'ENTERTAINMENT' THEN 'location-type-entertainment'
        END
        WHERE "typeId" IS NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Place" WHERE "typeId" IS NULL) THEN
        RAISE EXCEPTION 'Every place must have a location type before migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "Place"
        WHERE "latitude" IS NULL OR "longitude" IS NULL
    ) THEN
        RAISE EXCEPTION 'Resolve coordinates for every place before removing the Google Maps draft';
    END IF;
END $$;

ALTER TABLE "Place" ALTER COLUMN "typeId" SET NOT NULL;
ALTER TABLE "Place" ALTER COLUMN "latitude" SET NOT NULL;
ALTER TABLE "Place" ALTER COLUMN "longitude" SET NOT NULL;

DROP INDEX IF EXISTS "Place_type_isVisible_idx";
DROP INDEX IF EXISTS "Place_googlePlaceId_key";

ALTER TABLE "Place" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Place" DROP COLUMN IF EXISTS "googlePlaceId";
DROP TYPE IF EXISTS "PlaceType";

CREATE INDEX IF NOT EXISTS "LocationType_isVisible_navigationOrder_idx"
ON "LocationType"("isVisible", "navigationOrder");

CREATE INDEX IF NOT EXISTS "Place_typeId_isVisible_idx"
ON "Place"("typeId", "isVisible");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Place_typeId_fkey'
    ) THEN
        ALTER TABLE "Place"
        ADD CONSTRAINT "Place_typeId_fkey"
        FOREIGN KEY ("typeId") REFERENCES "LocationType"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
