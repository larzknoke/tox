-- CreateEnum
CREATE TYPE "UserAddressType" AS ENUM ('BILLING', 'DELIVERY');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN     "defaultBillingAddressId" INTEGER,
ADD COLUMN     "defaultDeliveryAddressId" INTEGER;

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UserAddressType" NOT NULL,
    "label" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "vat" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_addresses_userId_type_idx" ON "user_addresses"("userId", "type");

-- Backfill existing billing addresses into the new user address book.
WITH inserted_billing AS (
    INSERT INTO "user_addresses" (
        "userId",
        "type",
        "label",
        "firstName",
        "lastName",
        "company",
        "vat",
        "address1",
        "address2",
        "postalCode",
        "city",
        "country",
        "phone",
        "createdAt",
        "updatedAt"
    )
    SELECT
        u."id",
        'BILLING'::"UserAddressType",
        COALESCE(NULLIF(a."company", ''), 'Billing Address'),
        a."firstName",
        a."lastName",
        a."company",
        a."vat",
        a."address1",
        a."address2",
        a."postalCode",
        a."city",
        a."country",
        a."phone",
        a."createdAt",
        a."updatedAt"
    FROM "users" u
    INNER JOIN "addresses" a ON a."id" = u."billingAddressId"
    WHERE u."billingAddressId" IS NOT NULL
    RETURNING "id", "userId"
)
UPDATE "users" u
SET "defaultBillingAddressId" = inserted_billing."id"
FROM inserted_billing
WHERE inserted_billing."userId" = u."id";

-- Backfill existing delivery addresses into the new user address book.
WITH inserted_delivery AS (
    INSERT INTO "user_addresses" (
        "userId",
        "type",
        "label",
        "firstName",
        "lastName",
        "company",
        "vat",
        "address1",
        "address2",
        "postalCode",
        "city",
        "country",
        "phone",
        "createdAt",
        "updatedAt"
    )
    SELECT
        u."id",
        'DELIVERY'::"UserAddressType",
        COALESCE(NULLIF(a."company", ''), 'Delivery Address'),
        a."firstName",
        a."lastName",
        a."company",
        NULL,
        a."address1",
        a."address2",
        a."postalCode",
        a."city",
        a."country",
        a."phone",
        a."createdAt",
        a."updatedAt"
    FROM "users" u
    INNER JOIN "addresses" a ON a."id" = u."deliveryAddressId"
    WHERE u."deliveryAddressId" IS NOT NULL
    RETURNING "id", "userId"
)
UPDATE "users" u
SET "defaultDeliveryAddressId" = inserted_delivery."id"
FROM inserted_delivery
WHERE inserted_delivery."userId" = u."id";

-- AddForeignKey
ALTER TABLE "user_addresses"
ADD CONSTRAINT "user_addresses_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users"
ADD CONSTRAINT "users_defaultBillingAddressId_fkey"
FOREIGN KEY ("defaultBillingAddressId") REFERENCES "user_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "users"
ADD CONSTRAINT "users_defaultDeliveryAddressId_fkey"
FOREIGN KEY ("defaultDeliveryAddressId") REFERENCES "user_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove previous single-address user links.
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_billingAddressId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_deliveryAddressId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_billingAddressId_key";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_deliveryAddressId_key";

ALTER TABLE "users"
DROP COLUMN IF EXISTS "billingAddressId",
DROP COLUMN IF EXISTS "deliveryAddressId";
