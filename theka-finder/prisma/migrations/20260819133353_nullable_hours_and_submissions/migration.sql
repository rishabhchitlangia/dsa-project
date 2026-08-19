-- CreateEnum
CREATE TYPE "ShopSource" AS ENUM ('curated', 'osm', 'community');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "osmId" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "source" "ShopSource" NOT NULL DEFAULT 'curated',
ADD COLUMN     "status" "ShopStatus" NOT NULL DEFAULT 'approved',
ADD COLUMN     "submittedByName" TEXT,
ADD COLUMN     "submittedNote" TEXT,
ADD COLUMN     "submitterKey" TEXT,
ALTER COLUMN "hoursWeekday" DROP NOT NULL,
ALTER COLUMN "hoursWeekend" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_osmId_key" ON "Shop"("osmId");

-- CreateIndex
CREATE INDEX "Shop_status_idx" ON "Shop"("status");

-- CreateIndex
CREATE INDEX "Shop_status_category_idx" ON "Shop"("status", "category");

