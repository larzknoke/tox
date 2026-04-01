-- CreateTable
CREATE TABLE "TravelReport" (
    "id" SERIAL NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "destination" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "teamId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "travelReportId" INTEGER NOT NULL,
    "driver" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "noCharge" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TravelReport_teamId_travelDate_idx" ON "TravelReport"("teamId", "travelDate");

-- CreateIndex
CREATE INDEX "Vehicle_travelReportId_idx" ON "Vehicle"("travelReportId");

-- AddForeignKey
ALTER TABLE "TravelReport" ADD CONSTRAINT "TravelReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelReport" ADD CONSTRAINT "TravelReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_travelReportId_fkey" FOREIGN KEY ("travelReportId") REFERENCES "TravelReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
