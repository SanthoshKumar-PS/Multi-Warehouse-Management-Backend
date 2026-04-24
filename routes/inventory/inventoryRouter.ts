import express from 'express'
import { loginWarehouseTrigram, getInventoryStock, getInventoryProduct, getInventoryProductWithTransactions, postInventoryTransaction, getInventoryTransactions, getProductAvailability } from '../../modules/inventory/controller/inventory.controller'
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { authorizeWarehouse } from '../../middleware/authorizeWarehouseAccess'
import { createNewTransfer, dispatchTransferItems, getTransfers, getTransferByTransferNo, receiveTransferItems, cancelTransferItems } from '../../modules/transfer/controller/transfer.controller'
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder, getPurchaseOrderByNumber, getSupplierList, getProductForPurchase, closePurchaseOrder } from '../../modules/purchase-order/controller/purchase.controller'


export const inventoryRouter = express.Router();

inventoryRouter.post('/loginWarehouse', loginWarehouseTrigram)

inventoryRouter.get('/stock', authenticate, authorize(['view_warehouse']), authorizeWarehouse(),  getInventoryStock)

inventoryRouter.get('/stock/product', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  getInventoryProduct)

inventoryRouter.get('/stock/product/:productMn/availability', authenticate, authorize(['view_warehouse']), authorizeWarehouse(),  getProductAvailability)

inventoryRouter.get('/stock/inventoryProduct', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  getInventoryProductWithTransactions)

inventoryRouter.post('/stock/transaction', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  postInventoryTransaction)

inventoryRouter.get('/inventoryTransactions', authenticate, authorize(['view_warehouse']), authorizeWarehouse(),  getInventoryTransactions)



//Transfers
inventoryRouter.get('/transfers', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getTransfers)

inventoryRouter.get('/transfers/:transferNo', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getTransferByTransferNo)

inventoryRouter.patch('/transfers/dispatch/:transferNo', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), dispatchTransferItems)

inventoryRouter.patch('/transfers/receive/:transferNo', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), receiveTransferItems)

inventoryRouter.patch('/transfers/cancel/:transferNo', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), cancelTransferItems)

inventoryRouter.post('/transfers/new', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), createNewTransfer)


// Purchase Order
inventoryRouter.get('/purchase-orders', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getPurchaseOrders)

inventoryRouter.post('/purchase-orders/new', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), createPurchaseOrder)

inventoryRouter.patch('/purchase-orders/receive/:poNumber', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), receivePurchaseOrder)

inventoryRouter.patch('/purchase-orders/cancel/:poNumber', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), cancelPurchaseOrder)

inventoryRouter.patch('/purchase-orders/close/:poNumber', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), closePurchaseOrder)

inventoryRouter.get('/purchase-orders/poNumber/:poNumber', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getPurchaseOrderByNumber )

inventoryRouter.get('/purchase-orders/suppliers', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), getSupplierList)

inventoryRouter.get('/purchase-orders/products', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), getProductForPurchase)
