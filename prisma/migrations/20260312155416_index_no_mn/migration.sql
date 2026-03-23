/*
  Warnings:

  - A unique constraint covering the columns `[transferNo,productMn]` on the table `TransferItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TransferItem_transferNo_productMn_key` ON `TransferItem`(`transferNo`, `productMn`);
