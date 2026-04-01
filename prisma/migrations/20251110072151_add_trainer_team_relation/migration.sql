/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `TrainerTeamRelation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrainerTeamRelation" DROP CONSTRAINT "TrainerTeamRelation_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerTeamRelation" DROP CONSTRAINT "TrainerTeamRelation_trainerId_fkey";

-- AlterTable
ALTER TABLE "TrainerTeamRelation" DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "TrainerTeamRelation" ADD CONSTRAINT "TrainerTeamRelation_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerTeamRelation" ADD CONSTRAINT "TrainerTeamRelation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
