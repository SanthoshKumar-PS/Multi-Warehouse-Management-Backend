import { AuthRequest } from "../../../utils/AuthRequest";
import {Response} from 'express'
import prisma from "../../../utils/prisma";
import { validateRequest } from "../../../utils/validateRequest";
import { GetPurchaseOrdersSchema, GetPurchaseOrderByNumberSchema, NewPurchaseSchema } from "../validation/purchase.validate"
import { getPurchaseOrdersService, createNewPurchaseOrderService, getPurchaseOrderByNumberService } from "../service/purchase.service"

export const getPurchaseOrders = async (req: AuthRequest, res: Response) => {
    try {
        const authUser = req.authUser
        console.log("Req query: ",req.query);
        const validated = validateRequest(GetPurchaseOrdersSchema,{
            query: req.query
        })

        const response = await getPurchaseOrdersService(validated);

        return res.status(200).json({
            purchaseOrders: response.purchaseOrders,
            totalPages: response.totalRows===0 ? 1 : Math.ceil(response.totalRows/validated.limit)
        })


    } catch (error:any) {
        console.log("Error occured in getPurchaseOrders: ",error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' }); 
    }
}

export const createPurchaseOrder = async (req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const createdBy = authUser?.trigram ?? null;
        console.log("Req body: ",req.body);

        const validated = validateRequest(NewPurchaseSchema,{
            body:req.body,
            query:req.query
        });

        const { poOrderItems, supplierId,expectedDate, orderNotes, warehouseId, warehouseName } = validated;

        const response = await createNewPurchaseOrderService({
            poOrderItems, supplierId,expectedDate, orderNotes, warehouseId, warehouseName,
            createdBy
        })

        return res.status(200).json({message:"Purchase Order Created Successfully.", purchaseOrder: response.purchaseOrder})
        
    } catch (error:any) {
        console.log('Error occured in createPurchaseOrder: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });         
    }

}

export const getPurchaseOrderByNumber = async (req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req params: ",req.params);

        const validated = validateRequest(GetPurchaseOrderByNumberSchema, {
            query: req.query,
            params: req.params
        })

        const response = await getPurchaseOrderByNumberService(validated);

        return res.status(200).json({
            message: "Successfully fetched purchase order.",
            purchaseOrder: response.purchaseOrder
        })
        
    } catch (error:any) {
        console.log("Error occured in getPurchaseOrderByNumber: ",error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });
    }
}

export const getSupplierList = async (req:AuthRequest, res:Response) => {
    try {
        const suppliers = await prisma.supplier.findMany();

        console.log("Get Supplier list has been called");
        return res.status(200).json({message:"Fetched suppliers list", suppliers})
        
    } catch (error:any) {
        console.log('Error occured in getSupplierList: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });         
    }

}

export const getProductForPurchase = async (req:AuthRequest, res:Response) => {
    try {
        const products = await prisma.product.findMany({
            select:{
                mn: true,
                description: true,
                brand: true,
                family: true
            }
        });

        console.log("Get Supplier list has been called");
        return res.status(200).json({message:"Fetched purchase products list", products})
        
    } catch (error:any) {
        console.log('Error occured in getProductForPurchase: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });         
    }

}