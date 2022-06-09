/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `attachment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_profileId_fkey";

-- AlterTable
ALTER TABLE "attachment" ADD COLUMN     "postId" TEXT,
ALTER COLUMN "profileId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attachment_postId_key" ON "attachment"("postId");

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
