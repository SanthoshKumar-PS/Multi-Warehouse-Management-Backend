import prisma from '../../../utils/prisma'
import { NewPurchaseType, GetPurchaseOrderByNumberType, GetPurchaseOrdersType, ReceivePurchaseItemsType, CancelPurchaseItemsType, ClosePurchaseItemsType } from '../validation/purchase.validate'
import getPurchaseDate from '../utils/getPurchaseDate';
import { getNextFormattedPurchaseNumber } from '../utils/getNextFormattedPurchaseNumber'
import ApiError from '../../../utils/ApiError';
import { InventoryTxnType, Prisma, PurchaseStatusType } from '@prisma/client'
import { applyInventoryTxn } from '../../inventory/domain/applyInventoryTxn';

export const getPurchaseOrdersService = async ({warehouseId, search, statusFilter, page, limit} : GetPurchaseOrdersType) => {
    const skip = (page-1)*limit;

    const whereClause: Prisma.PurchaseOrderWhereInput = {
        warehouseId: warehouseId
    }

    if(search){
        whereClause.OR = [
            {
                poNumber: {
                    contains: search
                }
            },
            {
                supplierName: {
                    contains: search                }
            },
            {
                items:{
                    some: {
                        productMn: {
                            contains: search
                        }
                    }
                }
            }
        ]
    }

    if(statusFilter!=='ALL'){
        whereClause.status = {
            equals: statusFilter
        }
    }

    const purchaseOrderPromise = prisma.purchaseOrder.findMany({
        where:{
            ...whereClause
        },
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit,
        skip
    });

    const totalRowsPromise = prisma.purchaseOrder.count({
        where:{
            ...whereClause
        }
    });


    const [purchaseOrders, totalRows] = await Promise.all([
        purchaseOrderPromise,
        totalRowsPromise
    ]);

    console.log("totalRows: ",totalRows);

    return { purchaseOrders, totalRows }
}


type createNewPurchaseOrderServiceType  = NewPurchaseType & {
    createdBy: string | null
}
export const createNewPurchaseOrderService = async ({poOrderItems, supplierId,expectedDate, orderNotes, warehouseId, warehouseName,createdBy}: createNewPurchaseOrderServiceType) => {
    const response = await prisma.$transaction(async (tx) => {
        // Generate Vr2 Date
        let newPurchaseNo
        const vr2PurchaseDate = getPurchaseDate();
        const formattedNumber = await getNextFormattedPurchaseNumber(tx, vr2PurchaseDate);
        newPurchaseNo = `${vr2PurchaseDate}-${formattedNumber}`;
        console.log("newPurchaseNo: ",newPurchaseNo);

        if (poOrderItems.length === 0) {
            throw new ApiError(400, "No items provided");
        }
        
        const supplier = await tx.supplier.findUnique({
            where:{
                id: supplierId
            }
        })
        if(!supplier){
            console.log("Supplier not found for provided supplierid");
            throw new ApiError(404, "Supplier not found.")
        }

        const products = await tx.product.findMany({
            where: {
                mn: { in: poOrderItems.map(po => po.productMn) }
            },
            select: { mn:true }
        })
        const validMns = new Set(products.map(p => p.mn))
        for (const prod of poOrderItems){
            if(!validMns.has(prod.productMn)){
                console.log("Product MN not found in product table.");
                throw new ApiError(400, `Invalid product: ${prod.productMn}`);
            }
        }
        const uniqueMns = new Set(poOrderItems.map(p => p.productMn));
        if (uniqueMns.size !== poOrderItems.length) {
            throw new ApiError(400, "Duplicate products not allowed");
        }

        const purchaseOrder = await tx.purchaseOrder.create({
            data: {
                poNumber: newPurchaseNo,
                warehouseId: warehouseId,
                warehouseName: warehouseName,
                supplierId: supplier.id,
                supplierName: supplier.name,
                status: PurchaseStatusType.CREATED,
                expectedDate: new Date(expectedDate),
                createdBy: createdBy??"UNKNOWN",
                remarks: orderNotes
            }
        })

        let purchaseOrderItemsData: Prisma.PurchaseOrderItemCreateManyInput[] = [];
        purchaseOrderItemsData = poOrderItems.map(prod => ({
            purchaseOrderId: purchaseOrder.id,
            productMn: prod.productMn,
            orderedQty: prod.orderedQty
        }))

        await tx.purchaseOrderItem.createMany({
            data: purchaseOrderItemsData
        })

        return {purchaseOrder}
    })

    return {purchaseOrder: response.purchaseOrder}
}


type receivePurchaseOrderServiceType = ReceivePurchaseItemsType & {
    createdBy: string | null
}
export const receivePurchaseOrderService = async ({warehouseId, warehouseName, poNumber, receivePurchaseItems, createdBy} : receivePurchaseOrderServiceType) => {
    const response = await prisma.$transaction(async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.findUnique({
            where:{
                poNumber
            }
        })
        
        if (!purchaseOrder) {
            throw new ApiError(404, "Purchase order not found.");
        }

        if (purchaseOrder.status === 'CLOSED') {
            throw new ApiError(400, "Cannot receive items for a closed purchase order.");
        }

        if (purchaseOrder.status !== 'CREATED' && purchaseOrder.status !== 'PARTIALLY_RECEIVED') {
            throw new ApiError(400, "Invalid purchase order status for receiving.");
        }

        const inventoryTransactionsData: Prisma.InventoryTransactionCreateManyInput[] = [];
        const productMns = [...new Set(receivePurchaseItems.map((item) => item.productMn))];
        const inventories = await tx.warehouseInventory.findMany({
            where:{
                warehouseId: warehouseId,
                productMn: {
                    in: productMns
                }
            }
        });

        const existingMns = new Set(inventories.map((inv) => inv.productMn));
        const missingMns = productMns.filter((mn) => !existingMns.has(mn));
        console.log("Missing products in warehouse: ", missingMns);

        if(missingMns.length>0){
            await tx.warehouseInventory.createMany({
                data: missingMns.map((mn) => ({
                    warehouseId:warehouseId,
                    productMn: mn,
                    physicalQty: 0,
                    reservedQty: 0,
                    minimumQty: 10,
                })),
                skipDuplicates: true
            })
        }

        const updatedInventories = await tx.warehouseInventory.findMany({
            where:{
                warehouseId: warehouseId,
                productMn: {
                    in: productMns
                }
            }
        })

        if(updatedInventories.length !== productMns.length){
            throw new ApiError(404, "Some products not found in warehouse inventory");
        }

        const inventoryMap = new Map(
            updatedInventories.map((inv) => [inv.productMn,inv])
        )

        for (const item of receivePurchaseItems) {
            if(item.orderedQty < item.receivedQty + item.receiveNowQty){
                throw new ApiError(400, `Total received quantity cannot exceed ordered quantity for ${item.productMn}`);
            }

            if(item.receiveNowQty>0){
                const receiveResult = await applyInventoryTxn(
                    tx,
                    inventoryMap,
                    inventoryTransactionsData,
                    {
                        warehouseId: warehouseId,
                        warehouseName: warehouseName,
                        productMn: item.productMn,
                        type: InventoryTxnType.INWARD,
                        qty: item.receiveNowQty,
                        reference: poNumber,
                        createdBy: createdBy,
                    },
                )
                const updatedPurchaseItem = await tx.purchaseOrderItem.updateMany({
                    where:{
                        purchaseOrderId: purchaseOrder.id,
                        productMn: item.productMn,
                        receivedQty:{
                            lte: item.orderedQty - item.receiveNowQty
                        }
                    },
                    data:{
                        receivedQty:{
                            increment: item.receiveNowQty
                        }
                    }
                })

                if(updatedPurchaseItem.count === 0){
                    throw new ApiError(400, `Concurrent update or over-receiving detected for ${item.productMn}`)                
                }
            }
        }

        const createdInventoryTransaction = await tx.inventoryTransaction.createMany({
            data: inventoryTransactionsData
        });

        console.log("createdInventoryTransaction: ",createdInventoryTransaction);

        const updatedItems = await tx.purchaseOrderItem.findMany({
            where:{
                purchaseOrderId: purchaseOrder.id
            }
        })

        const isFullyReceived = updatedItems.every(item => {
            return item.orderedQty === item.receivedQty
        })

        const result = await tx.purchaseOrder.update({
            where:{
                poNumber,
                status: {
                    in: ['CREATED', 'PARTIALLY_RECEIVED']
                }
            },
            data: {
                status: isFullyReceived ? 'COMPLETED' : 'PARTIALLY_RECEIVED'
            }
        })

        const updatedPurchaseOrder = await tx.purchaseOrder.findUnique({
            where:{
                poNumber
            },
            include:{
                items: true
            }
        });

        console.log("UpdatedPurchaseOrder: ", updatedPurchaseOrder);

        return { purchaseOrder: updatedPurchaseOrder }
    })

    const inventoryTransactions = await prisma.inventoryTransaction.findMany({
        where:{
            reference: poNumber
        },
        orderBy:{
            id: 'desc'
        },
        include:{
            product:{
                select:{
                    description: true
                }
            }
        }
    })

    return { purchaseOrder: response.purchaseOrder, inventoryTransactions }
}


export const cancelPurchaseOrderService = async ({ warehouseId, warehouseName, poNumber }:CancelPurchaseItemsType) => {
    const response = await prisma.$transaction(async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.findUnique({
            where:{
                poNumber
            }
        })

        if(!purchaseOrder || purchaseOrder.status!=='CREATED'){
            console.log("Purchase order not found or not in status Created")
            throw new ApiError(400, 'Invalid purchase order status for cancelling.')
        }

        if(purchaseOrder.warehouseId !== warehouseId){
            console.log("Unauthorized warehouse access.");
            throw new ApiError(403, 'Unauthorized warehouse access.');
        }

        const items = await tx.purchaseOrderItem.findMany({
            where:{
                purchaseOrderId: purchaseOrder.id
            }
        })

        const hasReceived = items.some(item => item.receivedQty>0)

        if(hasReceived){
            console.log("Cannot cancel purchase order with received items.");
            throw new ApiError(400, 'Cannot cancel purchase order with received items.');
        }

        const updatedPurchaseOrder = await tx.purchaseOrder.update({
            where:{
                poNumber,
                status: PurchaseStatusType.CREATED
            },
            data:{
                status: PurchaseStatusType.CANCELLED
            },
            include:{
                items: true
            }
        })

        return { purchaseOrder: updatedPurchaseOrder }
    })

    return { purchaseOrder: response.purchaseOrder }
}

export const closePurchaseOrderService = async ({ warehouseId, warehouseName, poNumber }:ClosePurchaseItemsType) => {
    const response = await prisma.$transaction(async (tx) => {

        const result = await tx.purchaseOrder.updateMany({
            where:{
                poNumber,
                warehouseId,
                status: PurchaseStatusType.PARTIALLY_RECEIVED
            },
            data:{
                status: PurchaseStatusType.CLOSED
            }
        })
        
        if (result.count === 0) {
            console.log("Invalid status or unauthorized access");
            throw new ApiError(400, "Invalid purchase order status for closing.");
        }
        
        const updatedPurchaseOrder = await tx.purchaseOrder.findUnique({
            where: { poNumber },
            include: { items: true },
        });

        if (!updatedPurchaseOrder) {
            throw new ApiError(500, "Failed to fetch updated purchase order.");
        }

        const inventoryTransactions = await tx.inventoryTransaction.findMany({
            where:{
                reference: poNumber
            },
            orderBy: [
                { productMn: 'desc' },
                { id: 'asc' }
            ],
            include: {
                product: {
                    select: {
                        description: true
                    }
                }
            }
        })

        return { purchaseOrder: updatedPurchaseOrder, inventoryTransactions }
    })

    return { purchaseOrder: response.purchaseOrder, inventoryTransactions: response.inventoryTransactions }
}


export const getPurchaseOrderByNumberService = async ({ warehouseId, poNumber } : GetPurchaseOrderByNumberType) => {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where:{
            poNumber: poNumber
        },
        include: {
            items: {
                include: {
                    product:{
                        select:{
                            description:true
                        }
                    }
                }
            },
            supplier: {
                select: {
                    phone: true
                }
            }
        }
    })

    const inventoryTransactions = await prisma.inventoryTransaction.findMany({
        where:{
            reference: poNumber
        },
        orderBy: [
            { productMn: 'desc' },
            { id: 'asc' }
        ],
        include: {
            product: {
                select: {
                    description: true
                }
            }
        }
    })

    console.log("purchaseOrder: ",purchaseOrder);
    console.log("inventoryTransactions: ",inventoryTransactions);
    return { purchaseOrder, inventoryTransactions }

}