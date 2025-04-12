-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CHAVES', 'ELETRONICOS', 'DOCUMENTOS', 'ROUPAS', 'OUTROS');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PERDIDO', 'ENCONTRADO');

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "imagePath" TEXT,
    "status" "Status" NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");
