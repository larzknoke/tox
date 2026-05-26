ALTER TABLE "users"
ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "approvedBy" TEXT;

-- Keep existing accounts usable after rollout; only new signups remain pending.
UPDATE "users"
SET "approved" = true
WHERE "approved" = false;
