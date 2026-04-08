import { TransferItem, TransferStatus, WarehouseAccessType } from '@prisma/client';
import { transcode } from 'buffer';
import { z } from 'zod';

export const SelectedProductSchema = z.object({
    productMn: z.string().trim().min(2, "Product MN must have at least 2 characters"),
    description: z.string().trim(),
    availableQty: z.number().nonnegative("Available qty cannot be negative"),
    qty: z.number().positive("Quantity must be greater than 0"),
})
export type SelectedProductType = z.infer<typeof SelectedProductSchema>;

export const FromToWarehouseSchema = z.object({
    warehouseId: z.number().int().positive(),
    warehouseName: z.string().trim(),
    warehouseLocation: z.string().trim(),
    accessType: z.enum(Object.values(WarehouseAccessType) as [string, ...string[]])
})
export type FromToWarehouseType = z.infer<typeof FromToWarehouseSchema>;

export const NewTransferSchema = z.object({
    body: z.object({
        selectedProducts: z.array(SelectedProductSchema)
            .min(1,"At least one product must be selected."),
        fromWarehouse: FromToWarehouseSchema,
        toWarehouse: FromToWarehouseSchema
    })
}).superRefine((data,ctx) => {
    const { fromWarehouse, toWarehouse } = data.body;
    if(fromWarehouse.warehouseId === toWarehouse.warehouseId){
        ctx.addIssue({
            code:'custom',
            path:['body', 'toWarehouse', 'warehouseId'],
            message:'Source and destination warehouses must be different.'
        })
    }
    if(fromWarehouse.accessType!=='MANAGE'){
        ctx.addIssue({
            code:'custom',
            path:['body', 'fromWarehouse', 'accessType'],
            message:'You do not have permission on source warehouse to transfer.'
        })
    }
})
export type NewTransferType = z.infer<typeof NewTransferSchema>['body'];



export const TransferItemSchema = z.object({
    productMn: z.string().trim().min(2, "Product MN must have at least 2 characters"),
    id: z.coerce.number().positive(),
    transferId: z.coerce.number().positive(),
    transferNo: z.string().trim().min(1),
    requestedQty: z.coerce.number().min(0),
    dispatchedQty: z.coerce.number().min(0),
    receivedQty: z.coerce.number().min(0),
})
export type TransferItemType = z.infer<typeof TransferItemSchema>

export const DispatchTransferItemsSchema = z.object({
    body: z.object({
        fromWarehouseId: z.coerce.number().positive(),
        fromWarehouseName: z.string().trim().min(1,'From warehouse name is required.'),
        transferNo: z.string().trim().min(1),
        dispatchTransferItems: z.array(TransferItemSchema).min(1, "At least one transfer item is required")
    }),
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(),
    })
}).superRefine((data,ctx)=>{
    if(data.body.fromWarehouseId !== data.query.selectedWarehouseId){
        ctx.addIssue({
            code: 'custom',
            message:'From warehouse id and selected warehouse id must be same.',
            path:['body', 'fromWarehouseId']
        })
    }
})
export type DispatchTransferItemsType = z.infer<typeof DispatchTransferItemsSchema>['body'];

export const ReceiveTransferItemsSchema = z.object({
    body: z.object({
        toWarehouseId: z.coerce.number().positive(),
        toWarehouseName: z.string().trim().min(1,'To warehouse name is required.'),
        transferNo: z.string().trim().min(1),
        receiveTransferItems: z.array(TransferItemSchema).min(1,"At least one receive item is required")
    }),
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive()
    })
}).superRefine((data,ctx) => {
    if(data.body.toWarehouseId !== data.query.selectedWarehouseId){
        ctx.addIssue({
            code: 'custom',
            message: 'To warehouse id and selected warehouse id must be same.',
            path: ['body', 'toWarehouseId']
        })
    }
})
export type ReceiveTransferItemsType = z.infer<typeof ReceiveTransferItemsSchema>['body'];

export const CancelTransferItemsSchema = z.object({
    body: z.object({
        fromWarehouseId: z.coerce.number().positive(),
        fromWarehouseName: z.string().trim().min(1,'From warehouse name is required.'),
        transferNo: z.string().trim().min(1)
    }),
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive()
    })
}).superRefine((data,ctx) => {
    if(data.body.fromWarehouseId !== data.query.selectedWarehouseId){
        ctx.addIssue({
            code: 'custom',
            message: 'From warehouse id and selected warehouse id must be same to cancel transfer.',
            path: ['body', 'fromWarehouseId']
        })
    }
})
export type CancelTransferItemsType = z.infer<typeof CancelTransferItemsSchema>['body'];

export const GetTransfersSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive(), 
        debouncedSearch: z.string().trim().optional(), 
        statusFilter: z.enum([...Object.values(TransferStatus), 'ALL'] as const, "Status must be of type transfer or all."), 
        directionFilter: z.enum(['INBOUND', 'OUTBOUND','ALL']).optional() , 
        page: z.coerce.number().int().positive('Page number must be positive.').default(1),
        limit: z.coerce.number().int().positive('Limit must be positive').default(10)
    })
}).transform(({query}) => ({
    warehouseId: query.selectedWarehouseId,
    search: query.debouncedSearch, 
    statusFilter: query.statusFilter, 
    directionFilter: query.directionFilter , 
    page: query.page,
    limit: query.limit
}))
export type GetTransfersType = z.infer<typeof GetTransfersSchema>;


export const GetTransferByTransferNoSchema = z.object({
    query: z.object({
        selectedWarehouseId: z.coerce.number().positive()
    }),
    params: z.object({
        transferNo: z.string().trim().min(1)
    })
}).transform(data => ({
    warehouseId: data.query.selectedWarehouseId,
    transferNo: data.params.transferNo
}));
export type GetTransferByTransferNoType = z.infer<typeof GetTransferByTransferNoSchema>;