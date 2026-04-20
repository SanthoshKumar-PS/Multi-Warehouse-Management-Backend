
// req.body:  {
//   poOrderItems: [
//     {
//       productMn: 'ASM-M10-144-530',
//       productDescription: 'ADANI Monofacial 530Wp Topcon DCR Module | 12 Years Warranty',
//       orderedQty: 1
//     }
//   ],
//   supplierId: 1,
//   expectedDate: '2026-04-19T18:30:00.000Z',
//   orderNotes: ''
// }
// req.query:  { selectedWarehouseId: '1', selectedWarehouseName: 'FestaHouse' }
import { z } from 'zod';

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
        selectedWarehouseName: z.string()
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