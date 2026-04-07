import { InventoryTxnType, Prisma } from '@prisma/client';
import prisma from '../../../utils/prisma';
import ApiError from '../../../utils/ApiError';
import { calculateInventoryInputs } from '../domain/calculateInventoryInputs'
import { deriveQtyChangeFromTxnType } from '../domain/deriveQtyChangeFromTxnType'
import { validateInventoryTransaction } from '../domain/validateInventoryTxn'
import { PostInventoryTransactionServiceType } from '../services/inventory.service';
import { GetInventoryProductWithTransactionsType, GetInventoryTransactionsType } from '../validation/inventory.validation';


export const getInventoryWithTransactionsRepo = ({warehouseId, productMn, page, limit} : GetInventoryProductWithTransactionsType) => {
    
    const skip = (page-1)*limit;
    const inventoryProductPromise = prisma.warehouseInventory.findUnique({
        where:{
            warehouseId_productMn:{
                warehouseId:warehouseId,
                productMn:productMn
            }
        },
        include:{
            product:true
        }
    });
    
    const whereClause: Prisma.InventoryTransactionWhereInput = {
        warehouseId:warehouseId,
        productMn:productMn
    }


    const inventoryTransactionsPromise = prisma.inventoryTransaction.findMany({
        where: whereClause,
        orderBy:{
            createdAt:'desc',
        },
        take: limit,
        skip
    })

    const totalCountPromise = prisma.inventoryTransaction.count({
        where: whereClause
    })

    return Promise.all([
        inventoryProductPromise,
        inventoryTransactionsPromise,
        totalCountPromise
    ])
}


export const postInventoryTransactionRepo = async ({warehouseId,warehouseName, productMn, type, qty, adjSign, reference, createdBy}:PostInventoryTransactionServiceType) => {
    const response = await prisma.$transaction(async (tx)=>{
        // Lock Rows
        await tx.$queryRaw`
        SELECT * FROM WarehouseInventory 
        WHERE warehouseId = ${warehouseId} AND productMn=${productMn} 
        FOR UPDATE`

        // Refetch Stock Data
        const warehouseinventory = await tx.warehouseInventory.findUnique({
            where:{
                warehouseId_productMn:{
                    warehouseId:warehouseId,
                    productMn:productMn
                }
            }
        });
        // console.log("Reftched stock data: ", warehouseinventory);

        if(!warehouseinventory){
            throw new ApiError(404, 'Product not found in this warehouse.')
        }

        const physicalQty = warehouseinventory.physicalQty
        const reservedQty = warehouseinventory.reservedQty

        const qtyChange = deriveQtyChangeFromTxnType(type,qty, adjSign)
            
        const validation = validateInventoryTransaction( {type, qtyChange, physicalQty, reservedQty});

        console.log("Validation output: ", validation);

        if(!validation.isValid){
            console.log("Validation failed: ",validation.error)
            throw new ApiError(400, validation.error ?? 'Validation Error.')
        }
        console.log("Qty Change: ", qtyChange);

        const { newPhysical, newReserved } = calculateInventoryInputs(type, physicalQty, reservedQty, qtyChange)
        
        console.log(`newPhysical: ${newPhysical} --- newReserver: ${newReserved}`)

        const updateWarehouseInventory = await tx.warehouseInventory.update({
            where:{
                warehouseId_productMn:{
                    warehouseId:Number(warehouseId),
                    productMn:productMn
                }                    
            },
            data:{
                physicalQty: newPhysical,
                reservedQty: newReserved
            }
        });

        const createdTransaction = await tx.inventoryTransaction.create({
            data:{
                warehouseId,
                warehouseName,
                productMn,
                qtyChange,
                type,
                reference,
                createdBy: createdBy,
                physicalBefore:physicalQty,
                physicalAfter:newPhysical,
                reservedBefore:reservedQty,
                reservedAfter:newReserved
            }
        })

            // Return After Update Stock
        return { updateWarehouseInventory, createdTransaction };

    },{
        maxWait:5000,
        timeout:20000,
    })

    return response
}



export const getInventoryTransactionsRepo = ({warehouseId, search, txnType, dateFrom, dateTo, page,limit}:GetInventoryTransactionsType) => {
    const skip = (page-1)*limit;
    const whereClause: Prisma.InventoryTransactionWhereInput = {
            warehouseId:warehouseId
        };

        if (txnType && txnType !== "ALL") {
            whereClause.type = txnType
        }

        if(dateFrom || dateTo){
            whereClause.createdAt = {}
            if(dateFrom){
                whereClause.createdAt.gte = dateFrom;
            }

            if(dateTo){
                whereClause.createdAt.lte = dateTo;
            }
        }

        if (search) {
            whereClause.OR = [
                {
                    productMn: {
                        contains: search,
                    },
                },
                {
                    reference: {
                        contains: search,
                    },
                },
            ];
        }

        const inventoryTransactionsPromise = prisma.inventoryTransaction.findMany({
            where: whereClause,
            include:{
                product:{
                    select:{
                        description:true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            },
            take:limit,
            skip
        })
        const totalRowsPromise = prisma.inventoryTransaction.count({
            where: whereClause
        })

        return Promise.all([
            inventoryTransactionsPromise,
            totalRowsPromise
        ])
}