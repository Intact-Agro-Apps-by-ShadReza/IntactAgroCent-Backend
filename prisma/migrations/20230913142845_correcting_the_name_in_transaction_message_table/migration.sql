/*
  Warnings:

  - You are about to drop the column `transactionFromTo` on the `TransactionMessage` table. All the data in the column will be lost.
  - Added the required column `transactionToId` to the `TransactionMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionMessage" DROP COLUMN "transactionFromTo",
ADD COLUMN     "transactionToId" TEXT NOT NULL;
