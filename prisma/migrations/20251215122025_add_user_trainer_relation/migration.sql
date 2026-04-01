-- AlterTable
ALTER TABLE "user" ADD COLUMN     "trainerId" INTEGER;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
