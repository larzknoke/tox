/*
  Warnings:

  - You are about to drop the `support_attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ShippingMode" AS ENUM ('STANDARD', 'SPECIAL');

-- DropForeignKey
ALTER TABLE "support_attachments" DROP CONSTRAINT "support_attachments_supportTicketId_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "parcelCount" INTEGER,
ADD COLUMN     "parcelHeightCm" DOUBLE PRECISION,
ADD COLUMN     "parcelLengthCm" DOUBLE PRECISION,
ADD COLUMN     "parcelWeightKg" DOUBLE PRECISION,
ADD COLUMN     "parcelWidthCm" DOUBLE PRECISION,
ADD COLUMN     "shippingMode" "ShippingMode",
ADD COLUMN     "ticketCount" INTEGER;

-- DropTable
DROP TABLE "support_attachments";
