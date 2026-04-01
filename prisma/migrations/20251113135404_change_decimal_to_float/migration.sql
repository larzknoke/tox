/*
  Warnings:

  - You are about to alter the column `hourlyRate` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `totalCost` on the `Bill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `durationHours` on the `BillEvent` table. The data in that column could be lost. The data in that column will be cast from `Decimal(6,2)` to `DoublePrecision`.
  - You are about to alter the column `hourlyRate` on the `BillEvent` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `cost` on the `BillEvent` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "hourlyRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalCost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "BillEvent" ALTER COLUMN "durationHours" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "hourlyRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "cost" SET DATA TYPE DOUBLE PRECISION;
