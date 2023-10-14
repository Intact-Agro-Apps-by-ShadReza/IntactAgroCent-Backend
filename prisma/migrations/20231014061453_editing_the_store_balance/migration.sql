/*
  Warnings:

  - Added the required column `moneyInBdtForPendingWithdrawls` to the `StoreBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withdrawlStatus` to the `WithdrawlRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StoreBalance" ADD COLUMN     "moneyInBdtForPendingWithdrawls" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "WithdrawlRequest" ADD COLUMN     "withdrawlStatus" TEXT NOT NULL;
