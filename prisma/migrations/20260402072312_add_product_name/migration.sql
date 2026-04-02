/*
  Warnings:

  - You are about to drop the column `nameEn` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `nameFr` on the `products` table. All the data in the column will be lost.
  - Added the required column `name` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "nameEn",
DROP COLUMN "nameFr",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
