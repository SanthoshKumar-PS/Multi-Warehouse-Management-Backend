import { z } from 'zod';
import { InventoryTxnType } from '@prisma/client';


export const WarehouseSchema = z.object({
  query: z.object({
    selectedWarehouseId : z.coerce.number().int().positive('Warehouse Id must be positive.')
  }).transform(data => ({
        warehouseId: data.selectedWarehouseId
      }))
})
export type WarehouseIdType = z.infer<typeof WarehouseSchema>['query'];


export const GetInventoryProductSchema = z.object({
  query: z.object({
    selectedWarehouseId : z.coerce.number().int().positive('Warehouse Id must be positive.'),
    productMn : z.string().trim().min(2,'Product MN must have any 2 characters.')
  }).transform(data => ({
        warehouseId: data.selectedWarehouseId,
        productMn:data.productMn
      }))
}) 
export type GetInventoryProductType = z.infer<typeof GetInventoryProductSchema>['query'];

export const GetProductAvailabilitySchema = z.object({
  params: z.object({
    productMn: z.string().trim().min(2,'Product MN must have any 2 characters.')
  })
})
export type GetProductAvailabilityType = z.infer<typeof GetProductAvailabilitySchema>['params'];

export const GetInventoryProductWithTransactionsSchema = z.object({
  query: z.object({
    selectedWarehouseId : z.coerce.number().int().positive('Warehouse Id must be positive.'),
    productMn : z.string().trim().min(2,'Product MN must have any 2 characters.'),
    page: z.coerce.number().int().positive('Page number must be positive.').default(1), 
    limit: z.coerce.number().int().positive('Limit must be positive').default(10)
  }).transform(data => ({
        warehouseId: data.selectedWarehouseId,
        productMn:data.productMn,
        page: data.page,
        limit: data.limit
      }))
})
export type GetInventoryProductWithTransactionsType = z.infer<typeof GetInventoryProductWithTransactionsSchema>['query'];


export const PostInventoryTransactionSchema = z.object({
  query: z.object({
    selectedWarehouseId : z.coerce.number().int().positive('Warehouse Id must be positive.'),
    selectedWarehouseName : z.string().trim().min(1,'Warehouse name is required.')
  }),
  body: z.object({
    productMn : z.string().trim().min(2,'Product MN must have any 2 characters.'),
    type: z.enum(InventoryTxnType, 'Inventory transaction type not valid.'),
    qty: z.coerce.number(),
    adjSign: z.coerce.number().default(1).catch(1).refine(val => val===-1 || val===1, {
      message:'AdjSign must be either -1 or 1.'
    }),
    reference: z.string().trim().optional()
  }) 
}).transform(({query,body}) => ({
        warehouseId: query.selectedWarehouseId,
        warehouseName: query.selectedWarehouseName,
        productMn:body.productMn,
        type: body.type,
        qty: body.qty,
        adjSign: body.adjSign,
        reference: body.reference
      }))
export type PostInventoryTransactionType = z.infer<typeof PostInventoryTransactionSchema>;


export const GetInventoryTransactionsSchema = z.object({
  query: z.object({
    selectedWarehouseId : z.coerce.number().int().positive('Warehouse Id must be positive.'),
    debouncedSearch: z.string().trim().optional(), 
    txnType: z.enum([...Object.values(InventoryTxnType) , 'ALL'] as const), 
    dateFrom: z.string().trim().optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((val) => !val || val <= new Date(), {
        message: "Date From must be in the past.",
      }),
    dateTo: z.string().trim().optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((val) => !val || val <= new Date(), {
        message: "Date To must be in the past.",
      }),
    page: z.coerce.number().int().positive('Page number must be positive.').default(1), 
    limit: z.coerce.number().int().positive('Limit must be positive').default(10)
  })
  .refine(data => !data.dateFrom || !data.dateTo || data.dateTo>=data.dateFrom,{
    path:['dateTo'],
    message:"'dateTo' date must be greater than 'dateFrom' date"
  })
  .transform(data => ({
        warehouseId: data.selectedWarehouseId,
        search: data.debouncedSearch, 
        txnType: data.txnType, 
        dateFrom: data.dateFrom, 
        dateTo: data.dateTo,
        page: data.page,
        limit: data.limit
      }))
})
export type GetInventoryTransactionsType = z.infer<typeof GetInventoryTransactionsSchema>['query']
