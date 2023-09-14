/*
  Warnings:

  - A unique constraint covering the columns `[trxId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trxId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "trxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_trxId_key" ON "Transaction"("trxId");
