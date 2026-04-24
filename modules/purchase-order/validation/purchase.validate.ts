import { PurchaseStatusType } from '@prisma/client';
import { z } from 'zod';

export const GetPurchaseOrdersSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(), 
        debouncedSearch: z.string().trim().optional(), 
        statusFilter: z.enum([...Object.values(PurchaseStatusType), 'ALL'] as const, "Status must be of type purchase or all."), 
        page: z.coerce.number().int().positive('Page number must be positive.').default(1),
        limit: z.coerce.number().int().positive('Limit must be positive').default(10)
    })
}).transform(({query}) => ({
    warehouseId: query.selectedWarehouseId,
    search: query.debouncedSearch, 
    statusFilter: query.statusFilter, 
    page: query.page,
    limit: query.limit
}))
export type GetPurchaseOrdersType = z.infer<typeof GetPurchaseOrdersSchema>;


export const PurchaseOrderItemSchema = z.object({
    productMn: z.string().trim().min(2, "Product MN must have at least 2 characters"),
    productDescription: z.string().trim(),
    orderedQty: z.coerce.number().int().min(1, "Quantity must be at least 1")
});
export type PurchaseOrderItemType = z.infer<typeof PurchaseOrderItemSchema>;

export const NewPurchaseSchema = z.object({
    body: z.object({
        poOrderItems: z.array(PurchaseOrderItemSchema).min(1,"At least one product is needed to create purchase order."),
        supplierId: z.coerce.number().int().positive(),
        expectedDate: z.coerce.date(),
        orderNotes: z.string().trim().optional()
    }),
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(),
        selectedWarehouseName: z.string().trim()
    })
}).transform(({body, query}) => ({
    poOrderItems: body.poOrderItems,
    supplierId: body.supplierId,
    expectedDate: body.expectedDate,
    orderNotes: body.orderNotes,
    warehouseId: query.selectedWarehouseId,
    warehouseName: query.selectedWarehouseName
}))
export type NewPurchaseType = z.infer<typeof NewPurchaseSchema>;


export const ReceiveItemSchema = z.object({
    id: z.coerce.number().positive(),
    purchaseOrderId: z.coerce.number().positive(),
    productMn: z.string().trim().min(2, "Product MN must have at least 2 characters"),
    orderedQty: z.coerce.number().min(1),
    receivedQty: z.coerce.number().min(0),
    receiveNowQty: z.coerce.number().min(0)
})
export type ReceiveItemType = z.infer<typeof ReceiveItemSchema>;

export const ReceivePurchaseItemsSchema = z.object({
    body: z.object({
        poNumber: z.string().trim().min(1),
        receivePurchaseItems: z.array(ReceiveItemSchema).min(1, "At least one receive item is required.")
    }),
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(),
        selectedWarehouseName: z.string().trim()
    })
}).transform(({body, query}) => ({
    warehouseId: query.selectedWarehouseId,
    warehouseName: query.selectedWarehouseName,
    poNumber: body.poNumber,
    receivePurchaseItems: body.receivePurchaseItems
}))
export type ReceivePurchaseItemsType = z.infer<typeof ReceivePurchaseItemsSchema>;


export const CancelPurchaseItemsSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(),
        selectedWarehouseName: z.string().trim()
    }),
    params: z.object({
        poNumber: z.string().trim().min(1)
    })
}).transform(({query, params}) => ({
    warehouseId: query.selectedWarehouseId,
    warehouseName: query.selectedWarehouseName,
    poNumber: params.poNumber
}))
export type CancelPurchaseItemsType = z.infer<typeof CancelPurchaseItemsSchema>;

export const ClosePurchaseItemsSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(),
        selectedWarehouseName: z.string().trim()
    }),
    params: z.object({
        poNumber: z.string().trim().min(1)
    })
}).transform(({query, params}) => ({
    warehouseId: query.selectedWarehouseId,
    warehouseName: query.selectedWarehouseName,
    poNumber: params.poNumber
}))
export type ClosePurchaseItemsType = z.infer<typeof CancelPurchaseItemsSchema>;

export const GetPurchaseOrderByNumberSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive()
    }),
    params: z.object({
        poNumber: z.string().trim().min(1)
    })
}).transform(data => ({
    warehouseId: data.query.selectedWarehouseId,
    poNumber: data.params.poNumber
}))
export type GetPurchaseOrderByNumberType = z.infer<typeof GetPurchaseOrderByNumberSchema>;