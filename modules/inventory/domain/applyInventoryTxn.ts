import { InventoryTxnType, Prisma, WarehouseInventory } from "@prisma/client";
import ApiError from '../../../utils/ApiError';
import { validateInventoryTransaction } from './validateInventoryTxn'
import { deriveQtyChangeFromTxnType } from "./deriveQtyChangeFromTxnType";
import { calculateInventoryInputs } from './calculateInventoryInputs'

type ApplyInventoryTxnType = {
    warehouseId: number,
    productMn: string,
    type:InventoryTxnType, 
    qty: number,
    reference: string,
    createdBy: string | null
}

export const applyInventoryTxn = async (tx:Prisma.TransactionClient,inventoryMap: Map<string,WarehouseInventory> , inventoryTransactionsData:Prisma.InventoryTransactionCreateManyInput[] ,{
    warehouseId,
    productMn,
    type,
    qty,
    reference,
    createdBy
}: ApplyInventoryTxnType) => {
  const warehouseInventory = inventoryMap.get(productMn);

  if (!warehouseInventory) {
    throw new ApiError(404, `Product ${productMn} not found in warehouse`);
  }

  const qtyChange = deriveQtyChangeFromTxnType(type, qty);

  const validation = validateInventoryTransaction({
    type: type,
    qtyChange: qtyChange,
    physicalQty: warehouseInventory.physicalQty,
    reservedQty: warehouseInventory.reservedQty,
  });
  console.log("Validation output: ", validation);

  if (!validation.isValid) {
    const availableStock = warehouseInventory.physicalQty - warehouseInventory.reservedQty;
    console.log("Validation failed: ", validation.error);
    throw new ApiError(
      400,
      validation.error??`Insufficient stock for ${productMn}. Available: ${availableStock}, Requested: ${qty}`,
    );
  }

  const physicalBefore = warehouseInventory.physicalQty
  const reservedBefore = warehouseInventory.reservedQty

  const { newPhysical, newReserved } = calculateInventoryInputs(
    type,
    warehouseInventory.physicalQty,
    warehouseInventory.reservedQty,
    qtyChange,
  );

  const updatedWarehouseInventory = await tx.warehouseInventory.update({
    where: {
      warehouseId_productMn: {
        warehouseId: warehouseId,
        productMn: productMn,
      },
    },
    data: {
      physicalQty: newPhysical,
      reservedQty: newReserved,
    },
  });

  // Update the map - Map stores object references, updating this object automatically updates the Map
  warehouseInventory.physicalQty = newPhysical;
  warehouseInventory.reservedQty = newReserved;

  inventoryTransactionsData.push({
    warehouseId: warehouseId,
    productMn: productMn,
    qtyChange: qtyChange,
    type: type,
    reference: reference,
    createdBy: createdBy,
    physicalBefore,
    physicalAfter: newPhysical,
    reservedBefore,
    reservedAfter: newReserved,
  });

  console.log("Applied Inventory Transaction: ",productMn);

  return { productMn, newPhysical, newReserved };
};
