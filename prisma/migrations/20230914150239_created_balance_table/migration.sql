-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investedMoneyInBDT" DOUBLE PRECISION NOT NULL,
    "withdrawedMoneyInBDT" DOUBLE PRECISION NOT NULL,
    "returnOnInvestmentMoneyInBDT" DOUBLE PRECISION NOT NULL,
    "referredMoneyInBDT" DOUBLE PRECISION NOT NULL,
    "extraMoneyInBDT" DOUBLE PRECISION NOT NULL,
    "balanceInBDT" DOUBLE PRECISION NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balance_id_key" ON "Balance"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_key" ON "Balance"("userId");
