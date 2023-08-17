/*
  Warnings:

  - You are about to drop the column `featuredPictureId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `featuredPictureLink` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "featuredPictureId",
ADD COLUMN     "featuredPictureLink" TEXT NOT NULL;
