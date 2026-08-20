-- AlterEnum
-- The new value is not referenced in this migration, so adding it inside the
-- migration transaction is safe on PostgreSQL 12+.
ALTER TYPE "ShopSource" ADD VALUE 'overture';

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "overtureId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_overtureId_key" ON "Shop"("overtureId");
