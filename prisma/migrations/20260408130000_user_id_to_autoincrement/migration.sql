-- This migration changes User.id from String (cuid) to Int (autoincrement)
-- and updates all foreign key references accordingly.
-- WARNING: This is destructive — all existing user data, sessions, accounts,
-- bills, orders, travel reports, support tickets will be lost.

-- Drop all FK constraints referencing users.id
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_fkey";
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_fkey";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_userId_fkey";
ALTER TABLE "support_tickets" DROP CONSTRAINT IF EXISTS "support_tickets_userId_fkey";

-- Drop FK on Bill (references users.id via userId)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Bill_userId_fkey' AND table_name = 'Bill') THEN
    ALTER TABLE "Bill" DROP CONSTRAINT "Bill_userId_fkey";
  END IF;
END $$;

-- Drop FK on TravelReport (references users.id via userId)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'TravelReport_userId_fkey' AND table_name = 'TravelReport') THEN
    ALTER TABLE "TravelReport" DROP CONSTRAINT "TravelReport_userId_fkey";
  END IF;
END $$;

-- Drop support_attachments FK to support_tickets
ALTER TABLE "support_attachments" DROP CONSTRAINT IF EXISTS "support_attachments_supportTicketId_fkey";

-- Drop support_attachments table and recreate
DROP TABLE IF EXISTS "support_attachments";

-- Drop support_tickets table and recreate
DROP TABLE IF EXISTS "support_tickets";

-- Drop sessions and accounts (they reference userId)
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "account";

-- Drop verification (no FK to user, but clean slate)
DROP TABLE IF EXISTS "verification";

-- Now alter users table: change id from TEXT to SERIAL
-- First drop the PK constraint
ALTER TABLE "users" DROP CONSTRAINT "users_pkey";

-- Drop billingAddressId and deliveryAddressId unique constraints
DROP INDEX IF EXISTS "users_billingAddressId_key";
DROP INDEX IF EXISTS "users_deliveryAddressId_key";

-- Drop the old id column and create new one
ALTER TABLE "users" DROP COLUMN "id";
ALTER TABLE "users" ADD COLUMN "id" SERIAL NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- Recreate unique indexes for user address columns
CREATE UNIQUE INDEX "users_billingAddressId_key" ON "users"("billingAddressId");
CREATE UNIQUE INDEX "users_deliveryAddressId_key" ON "users"("deliveryAddressId");

-- Update Bill.userId from TEXT to INTEGER
ALTER TABLE "Bill" DROP COLUMN "userId";
ALTER TABLE "Bill" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;

-- Update TravelReport.userId from TEXT to INTEGER
ALTER TABLE "TravelReport" DROP COLUMN "userId";
ALTER TABLE "TravelReport" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;

-- Update orders.userId from TEXT to INTEGER
ALTER TABLE "orders" DROP COLUMN "userId";
ALTER TABLE "orders" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;

-- Recreate session table with Int userId
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" INTEGER NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- Recreate account table with Int userId
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "account_userId_idx" ON "account"("userId");

-- Recreate verification table
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- Recreate support_tickets with Int id and Int userId
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" "SupportTicketType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- Recreate support_attachments with Int id and Int supportTicketId
CREATE TABLE "support_attachments" (
    "id" SERIAL NOT NULL,
    "supportTicketId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_attachments_pkey" PRIMARY KEY ("id")
);

-- Add all foreign key constraints
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_attachments" ADD CONSTRAINT "support_attachments_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove default 0 from userId columns (was only needed for the ALTER)
ALTER TABLE "Bill" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "TravelReport" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "userId" DROP DEFAULT;
