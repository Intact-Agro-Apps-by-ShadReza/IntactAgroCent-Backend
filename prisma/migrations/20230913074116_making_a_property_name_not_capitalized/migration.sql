/*
  Warnings:

  - You are about to drop the column `RoleId` on the `AdminPanel` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `AdminPanel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminPanel" DROP COLUMN "RoleId",
ADD COLUMN     "roleId" TEXT NOT NULL;
