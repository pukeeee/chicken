/*
  Warnings:

  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - A unique constraint covering the columns `[orderId,productId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deliveryAddress` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "customerName" SET NOT NULL,
ALTER COLUMN "customerPhone" SET NOT NULL,
ALTER COLUMN "deliveryAddress" SET NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."OrderItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "public"."OrderItem"("orderId", "productId");
