-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gstin` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sales` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Company_gstin_company_name_key`(`gstin`, `company_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gstin` VARCHAR(191) NOT NULL,
    `addressType` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `stateCode` VARCHAR(191) NOT NULL,
    `stateName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `deliveryGstin` VARCHAR(191) NULL,

    INDEX `Address_gstin_company_name_idx`(`gstin`, `company_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gstin` VARCHAR(191) NOT NULL,
    `addressType` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `stateCode` VARCHAR(191) NOT NULL,
    `stateName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `deliveryGstin` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `SalesAddress_gstin_company_name_idx`(`gstin`, `company_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orderDateIST` DATE NULL,
    `gstin` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `company_name` VARCHAR(191) NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `billToAddressId` INTEGER NULL,
    `shipToAddressId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `type_name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `numberItem` INTEGER NOT NULL,
    `seller` VARCHAR(100) NOT NULL,
    `transportType` VARCHAR(100) NOT NULL,
    `saleman` VARCHAR(100) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 0,
    `company_billing` INTEGER NOT NULL DEFAULT 0,
    `pdf_url` VARCHAR(255) NULL,
    `round_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `incoterm` VARCHAR(255) NULL,
    `hub` VARCHAR(191) NULL,
    `mode_of_booking` VARCHAR(191) NULL,
    `warehouse` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(100) NULL,
    `orderNoOld` VARCHAR(191) NULL,
    `qu_ai_date` DATETIME(3) NULL,
    `qu_ai_percent` DOUBLE NULL,
    `billToSalesAddrId` INTEGER NULL,
    `shipToSalesAddrId` INTEGER NULL,
    `stick1_url` VARCHAR(255) NULL,
    `DateOK` DATETIME(3) NULL,
    `totalNoGst` DECIMAL(10, 2) NULL DEFAULT 0.00,

    UNIQUE INDEX `SalesOrder_orderNo_key`(`orderNo`),
    INDEX `SalesOrder_warehouse_idx`(`warehouse`),
    INDEX `SalesOrder_billToSalesAddrId_fkey`(`billToSalesAddrId`),
    INDEX `SalesOrder_gstin_company_name_fkey`(`gstin`, `company_name`),
    INDEX `SalesOrder_shipToSalesAddrId_fkey`(`shipToSalesAddrId`),
    INDEX `idx_sales_report_optimized`(`company_name`, `type`, `orderDate`, `saleman`, `totalPrice`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `amountPaid` DECIMAL(12, 2) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `paymentStatus` ENUM('PENDING', 'APPROVED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvedBy` VARCHAR(20) NULL,
    `paymentType` ENUM('SCREENSHOT', 'ADJUSTMENT', 'FINANCE') NOT NULL DEFAULT 'SCREENSHOT',

    INDEX `SalesPayment_orderNo_fkey`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `mnId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `rateUnit` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `taxableAmount` DOUBLE NOT NULL,
    `taxedAmount` DOUBLE NOT NULL,
    `igst` DOUBLE NOT NULL,
    `igstAmount` DOUBLE NOT NULL,
    `cgst` DOUBLE NOT NULL,
    `cgstAmount` DOUBLE NOT NULL,
    `sgst` DOUBLE NOT NULL,
    `sgstAmount` DOUBLE NOT NULL,

    INDEX `OrderDetails_mnId_idx`(`mnId`),
    INDEX `OrderDetails_orderId_fkey`(`orderId`),
    INDEX `OrderDetails_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand` VARCHAR(191) NOT NULL DEFAULT '',
    `mn` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL DEFAULT '',
    `power` DECIMAL(65, 30) NULL DEFAULT 0.000000000000000000000000000000,
    `description` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `brand_short` VARCHAR(191) NOT NULL DEFAULT '',
    `desc_offcial` VARCHAR(191) NOT NULL DEFAULT '',
    `group` INTEGER NULL DEFAULT 0,
    `igst` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `mn_pn` VARCHAR(191) NOT NULL DEFAULT '',
    `pn` VARCHAR(191) NULL DEFAULT '',
    `family` VARCHAR(191) NOT NULL DEFAULT '',
    `company_name` VARCHAR(191) NOT NULL,
    `hsn` VARCHAR(191) NOT NULL,
    `initial_stock` INTEGER NOT NULL DEFAULT 100,
    `unit_price` VARCHAR(191) NULL,
    `warranty` INTEGER NULL,

    UNIQUE INDEX `Product_mn_key`(`mn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductPrice` (
    `mn` VARCHAR(191) NOT NULL,
    `mrp` DECIMAL(10, 2) NOT NULL,
    `price1` DECIMAL(10, 2) NOT NULL,
    `price2` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`mn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warehouse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WarehouseInventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `warehouseId` INTEGER NOT NULL,
    `productMn` VARCHAR(191) NOT NULL,
    `physicalQty` INTEGER NOT NULL,
    `reservedQty` INTEGER NOT NULL,
    `minimumQty` INTEGER NOT NULL DEFAULT 0,

    INDEX `WarehouseInventory_productMn_fkey`(`productMn`),
    UNIQUE INDEX `WarehouseInventory_warehouseId_productMn_key`(`warehouseId`, `productMn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `warehouseId` INTEGER NOT NULL,
    `productMn` VARCHAR(191) NOT NULL,
    `qtyChange` INTEGER NOT NULL,
    `type` ENUM('INWARD', 'OUTWARD', 'RESERVE', 'RELEASE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `physicalAfter` INTEGER NOT NULL,
    `physicalBefore` INTEGER NOT NULL,
    `reservedAfter` INTEGER NOT NULL,
    `reservedBefore` INTEGER NOT NULL,

    INDEX `InventoryTransaction_warehouseId_idx`(`warehouseId`),
    INDEX `InventoryTransaction_productMn_idx`(`productMn`),
    INDEX `InventoryTransaction_createdBy_idx`(`createdBy`),
    INDEX `InventoryTransaction_warehouseId_productMn_idx`(`warehouseId`, `productMn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransferOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transferNo` VARCHAR(191) NOT NULL,
    `fromWarehouseId` INTEGER NOT NULL,
    `toWarehouseId` INTEGER NOT NULL,
    `fromWarehouseName` VARCHAR(191) NULL,
    `toWarehouseName` VARCHAR(191) NULL,
    `status` ENUM('CREATED', 'DISPATCHED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
    `createdBy` VARCHAR(191) NULL,
    `dispatchedAt` DATETIME(3) NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TransferOrder_transferNo_key`(`transferNo`),
    INDEX `TransferOrder_status_idx`(`status`),
    INDEX `TransferOrder_fromWarehouseId_idx`(`fromWarehouseId`),
    INDEX `TransferOrder_toWarehouseId_idx`(`toWarehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransferItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transferId` INTEGER NOT NULL,
    `transferNo` VARCHAR(191) NOT NULL,
    `productMn` VARCHAR(191) NOT NULL,
    `requestedQty` INTEGER NOT NULL,
    `dispatchedQty` INTEGER NOT NULL DEFAULT 0,
    `receivedQty` INTEGER NOT NULL DEFAULT 0,

    INDEX `TransferItem_transferId_idx`(`transferId`),
    UNIQUE INDEX `TransferItem_transferId_productMn_key`(`transferId`, `productMn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Salesman` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trigram` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `pwd` VARCHAR(191) NOT NULL,
    `rule` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `region` VARCHAR(191) NULL,

    UNIQUE INDEX `Salesman_trigram_key`(`trigram`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trigram` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `pwd` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `region` VARCHAR(191) NULL,

    UNIQUE INDEX `User_trigram_key`(`trigram`),
    INDEX `User_roleId_fkey`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `homepage` VARCHAR(100) NULL DEFAULT 'DOCS',

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Permission_action_key`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    INDEX `RolePermission_permissionId_fkey`(`permissionId`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserWarehouse` (
    `userId` INTEGER NOT NULL,
    `warehouseId` INTEGER NOT NULL,
    `accessType` ENUM('VIEW', 'MANAGE') NOT NULL DEFAULT 'VIEW',

    INDEX `UserWarehouse_warehouseId_fkey`(`warehouseId`),
    PRIMARY KEY (`userId`, `warehouseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameCode` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrderStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `transition` VARCHAR(191) NOT NULL,
    `duration_from_start` VARCHAR(191) NOT NULL,
    `duration_from_previous` VARCHAR(191) NOT NULL,

    INDEX `SalesOrderStatusHistory_orderNo_fkey`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gchat_WebHooks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sss` VARCHAR(50) NOT NULL DEFAULT 'bop',
    `ttt` VARCHAR(50) NOT NULL,
    `webhook` TEXT NOT NULL,

    UNIQUE INDEX `Gchat_WebHooks_ttt_key`(`ttt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gchat_Template` (
    `id_GT` VARCHAR(191) NOT NULL,
    `vcard` BOOLEAN NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `buttons` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `list_item` BOOLEAN NOT NULL DEFAULT false,
    `url_picture` VARCHAR(255) NULL,

    UNIQUE INDEX `Gchat_Template_id_GT_key`(`id_GT`),
    PRIMARY KEY (`id_GT`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gchat_Issue_To` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL DEFAULT 'bop',
    `statusTo` INTEGER NOT NULL,
    `statusFrom` INTEGER NULL,
    `sence` INTEGER NOT NULL,
    `id_GT` VARCHAR(191) NOT NULL,
    `to_webhook` VARCHAR(191) NOT NULL,
    `vite` BOOLEAN NOT NULL DEFAULT true,
    `eventType` ENUM('status_change', 'payment_uploaded', 'payment_approved') NOT NULL DEFAULT 'status_change',

    INDEX `Gchat_Issue_To_id_GT_fkey`(`id_GT`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gchat_Log` (
    `id_Log` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `issueToId` INTEGER NOT NULL,
    `status_to` INTEGER NOT NULL,
    `buttons` JSON NULL,
    `message` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,

    INDEX `Gchat_Log_issueToId_fkey`(`issueToId`),
    PRIMARY KEY (`id_Log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrderChangeLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `revision` INTEGER NOT NULL,
    `changedField` VARCHAR(100) NOT NULL,
    `oldValue` TEXT NULL,
    `newValue` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SalesOrderChangeLog_orderNo_fkey`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesTargets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trigram` CHAR(3) NOT NULL,
    `month_date` DATE NOT NULL,
    `target_inr` BIGINT NOT NULL,

    UNIQUE INDEX `uq_trigram_month`(`trigram`, `month_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `progress` FLOAT NOT NULL,
    `startDate` DATE NOT NULL,
    `status` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_gstin_company_name_fkey` FOREIGN KEY (`gstin`, `company_name`) REFERENCES `Company`(`gstin`, `company_name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrder` ADD CONSTRAINT `SalesOrder_billToSalesAddrId_fkey` FOREIGN KEY (`billToSalesAddrId`) REFERENCES `SalesAddress`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrder` ADD CONSTRAINT `SalesOrder_gstin_company_name_fkey` FOREIGN KEY (`gstin`, `company_name`) REFERENCES `Company`(`gstin`, `company_name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrder` ADD CONSTRAINT `SalesOrder_shipToSalesAddrId_fkey` FOREIGN KEY (`shipToSalesAddrId`) REFERENCES `SalesAddress`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesPayment` ADD CONSTRAINT `SalesPayment_orderNo_fkey` FOREIGN KEY (`orderNo`) REFERENCES `SalesOrder`(`orderNo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_mnId_fkey` FOREIGN KEY (`mnId`) REFERENCES `Product`(`mn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `SalesOrder`(`orderNo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductPrice` ADD CONSTRAINT `fk_ProductPrice_Product` FOREIGN KEY (`mn`) REFERENCES `Product`(`mn`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WarehouseInventory` ADD CONSTRAINT `WarehouseInventory_productMn_fkey` FOREIGN KEY (`productMn`) REFERENCES `Product`(`mn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WarehouseInventory` ADD CONSTRAINT `WarehouseInventory_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryTransaction` ADD CONSTRAINT `InventoryTransaction_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`trigram`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryTransaction` ADD CONSTRAINT `InventoryTransaction_productMn_fkey` FOREIGN KEY (`productMn`) REFERENCES `Product`(`mn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryTransaction` ADD CONSTRAINT `InventoryTransaction_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferOrder` ADD CONSTRAINT `TransferOrder_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`trigram`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferOrder` ADD CONSTRAINT `TransferOrder_fromWarehouseId_fkey` FOREIGN KEY (`fromWarehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferOrder` ADD CONSTRAINT `TransferOrder_toWarehouseId_fkey` FOREIGN KEY (`toWarehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferItem` ADD CONSTRAINT `TransferItem_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `TransferOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferItem` ADD CONSTRAINT `TransferItem_productMn_fkey` FOREIGN KEY (`productMn`) REFERENCES `Product`(`mn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserWarehouse` ADD CONSTRAINT `UserWarehouse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserWarehouse` ADD CONSTRAINT `UserWarehouse_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderStatusHistory` ADD CONSTRAINT `SalesOrderStatusHistory_orderNo_fkey` FOREIGN KEY (`orderNo`) REFERENCES `SalesOrder`(`orderNo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gchat_Issue_To` ADD CONSTRAINT `Gchat_Issue_To_id_GT_fkey` FOREIGN KEY (`id_GT`) REFERENCES `Gchat_Template`(`id_GT`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gchat_Log` ADD CONSTRAINT `Gchat_Log_issueToId_fkey` FOREIGN KEY (`issueToId`) REFERENCES `Gchat_Issue_To`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderChangeLog` ADD CONSTRAINT `SalesOrderChangeLog_orderNo_fkey` FOREIGN KEY (`orderNo`) REFERENCES `SalesOrder`(`orderNo`) ON DELETE CASCADE ON UPDATE CASCADE;

