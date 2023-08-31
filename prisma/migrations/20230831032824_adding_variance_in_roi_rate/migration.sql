/*
  Warnings:

  - You are about to drop the column `returnOnInterestRate` on the `Project` table. All the data in the column will be lost.
  - Added the required column `baseReturnOnInterestRate` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topReturnOnInterestRate` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "returnOnInterestRate",
ADD COLUMN     "baseReturnOnInterestRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "topReturnOnInterestRate" DOUBLE PRECISION NOT NULL;
