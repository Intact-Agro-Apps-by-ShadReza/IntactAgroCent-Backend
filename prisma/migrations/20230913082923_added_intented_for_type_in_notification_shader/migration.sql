/*
  Warnings:

  - Added the required column `initiatedForType` to the `NotificationShader` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationShader" ADD COLUMN     "initiatedForType" TEXT NOT NULL,
ALTER COLUMN "initiatedForId" DROP NOT NULL;
