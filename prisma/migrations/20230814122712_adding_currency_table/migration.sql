-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseTime" TIMESTAMP(3) NOT NULL,
    "expirationTimeInMinutes" INTEGER NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "convertionRates" JSONB NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_id_key" ON "Currency"("id");
