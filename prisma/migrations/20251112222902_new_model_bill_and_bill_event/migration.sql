-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "iban" TEXT,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillEvent" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "durationHours" DECIMAL(6,2) NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "cost" DECIMAL(10,2) NOT NULL,
    "canceled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_trainerId_teamId_quarter_year_key" ON "Bill"("trainerId", "teamId", "quarter", "year");

-- CreateIndex
CREATE INDEX "BillEvent_billId_startDate_idx" ON "BillEvent"("billId", "startDate");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillEvent" ADD CONSTRAINT "BillEvent_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
