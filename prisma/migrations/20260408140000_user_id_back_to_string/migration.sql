-- Revert User.id from Int autoincrement back to String (set by better-auth)
-- WARNING: Destructive — drops all user-related data.

-- Drop FK constraints referencing users.id
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_fkey";
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_fkey";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_userId_fkey";
ALTER TABLE "support_tickets" DROP CONSTRAINT IF EXISTS "support_tickets_userId_fkey";

-- Drop sessions, accounts, verification
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "verification";

-- Drop support tables
ALTER TABLE "support_attachments" DROP CONSTRAINT IF EXISTS "support_attachments_supportTicketId_fkey";
DROP TABLE IF EXISTS "support_attachments";
DROP TABLE IF EXISTS "support_tickets";

-- Alter users table: id from SERIAL to TEXT
ALTER TABLE "users" DROP CONSTRAINT "users_pkey";
ALTER TABLE "users" DROP COLUMN "id";
ALTER TABLE "users" ADD COLUMN "id" TEXT NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- Alter Bill.userId from INTEGER to TEXT
ALTER TABLE "Bill" DROP COLUMN "userId";
ALTER TABLE "Bill" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Bill" ALTER COLUMN "userId" DROP DEFAULT;

-- Alter TravelReport.userId from INTEGER to TEXT
ALTER TABLE "TravelReport" DROP COLUMN "userId";
ALTER TABLE "TravelReport" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TravelReport" ALTER COLUMN "userId" DROP DEFAULT;

-- Alter orders.userId from INTEGER to TEXT
ALTER TABLE "orders" DROP COLUMN "userId";
ALTER TABLE "orders" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ALTER COLUMN "userId" DROP DEFAULT;

-- Recreate session table with TEXT userId
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- Recreate account table with TEXT userId
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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

-- Recreate support_tickets with TEXT userId
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
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

-- Recreate support_attachments
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

-- Add FK constraints
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_attachments" ADD CONSTRAINT "support_attachments_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
