-- Add eventTypeId and backfill from categoria
ALTER TABLE "Event" ADD COLUMN "eventTypeId" INTEGER;

-- Ensure all categories exist in EventType
INSERT INTO "EventType" ("nome", "createdAt", "updatedAt")
SELECT DISTINCT e."categoria", NOW(), NOW()
FROM "Event" e
LEFT JOIN "EventType" et ON lower(et."nome") = lower(e."categoria")
WHERE e."categoria" IS NOT NULL AND e."categoria" <> '' AND et."id" IS NULL;

-- Backfill FK based on category name
UPDATE "Event" e
SET "eventTypeId" = et."id"
FROM "EventType" et
WHERE lower(et."nome") = lower(e."categoria");

ALTER TABLE "Event" ALTER COLUMN "eventTypeId" SET NOT NULL;
ALTER TABLE "Event" DROP COLUMN "categoria";

ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey"
FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
