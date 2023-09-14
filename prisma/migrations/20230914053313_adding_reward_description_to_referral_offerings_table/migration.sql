/*
  Warnings:

  - Added the required column `rewardDescription` to the `ReferralOfferings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReferralOfferings" ADD COLUMN     "rewardDescription" TEXT NOT NULL;
