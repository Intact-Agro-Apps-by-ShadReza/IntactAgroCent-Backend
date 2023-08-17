/*
  Warnings:

  - You are about to drop the column `pictureIds` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tagIds` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "pictureIds",
DROP COLUMN "tagIds",
ADD COLUMN     "pictureLinks" TEXT[],
ADD COLUMN     "tagNames" TEXT[];
