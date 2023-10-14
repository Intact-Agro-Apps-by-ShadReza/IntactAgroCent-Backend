-- CreateTable
CREATE TABLE "StoreBalance" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "updationTime" TIMESTAMP(3),
    "moneyInBdtInlet" DOUBLE PRECISION NOT NULL,
    "moneyInBdtOutlet" DOUBLE PRECISION NOT NULL,
    "moneyInBdtForWithdrawls" DOUBLE PRECISION NOT NULL,
    "moneyInBdtForReferrals" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StoreBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreBalance_id_key" ON "StoreBalance"("id");
