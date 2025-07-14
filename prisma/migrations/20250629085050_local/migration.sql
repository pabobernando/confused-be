-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "emergency_number" TEXT NOT NULL,
    "email" TEXT,
    "no_dada" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "payment_method" TEXT NOT NULL DEFAULT 'ONLINE',
    "orderId" TEXT,

    CONSTRAINT "Peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderId" TEXT NOT NULL,
    "snapToken" TEXT NOT NULL,
    "redirect_url" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_nik_key" ON "Peserta"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_no_dada_key" ON "Peserta"("no_dada");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_orderId_key" ON "Peserta"("orderId");

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;
