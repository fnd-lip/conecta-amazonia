-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "externalLink" VARCHAR(255),
ADD COLUMN     "logoUrl" VARCHAR(255),
ADD COLUMN     "relatedLinks" VARCHAR(255)[];
