import { Prisma, PrismaClient, InventoryTxnType  } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../utils/AuthRequest";
import { deriveQtyChangeFromTxnType } from '../../validations/deriveQtyChangeFromTxnType'
import { validateInventoryTransaction } from '../../validations/validateInventoryTxn'
import { calculateInventoryInputs } from '../../validations/calculateInventoryInputs'
const prisma = new PrismaClient();

export const loginWarehouseTrigram = async(req:Request, res:Response) => {
    const {trigram, password} = req.body;
    console.log("Req body recieved: ", trigram, password);

    if(!trigram || !password){
        console.log("Missing trigram or password.")
        return res.status(403).json({message:"Missing trigram or password."})
    }

    try {
        const user = await prisma.user.findUnique({
            where:{
                trigram
            },
            include:{
                role:{
                    include:{
                        permissions:{
                            include:{ permission:true }
                        }
                    }
                },
                warehouses:{
                    include:{
                        warehouse:true
                    }
                }
            }
        });

        if(!user){
            console.log("User Not Found.")
            return res.status(404).json({message:'User Not Found.'})
        }

        const isMatch  = user.pwd === password;

        if (!isMatch) {
        console.log("Password mismatch");
        return res.status(401).json({ message: "Invalid password" });
        }
        
        const permissions = user?.role.permissions.map((ap: any) => ap.permission.action);

        console.log("User: ",user)

        if(!user.warehouses || user.warehouses.length===0){
            console.log("No warehouse access assigned.")
            return res.status(403).json({message:'No warehouse access assigned.'})
        }

        const warehouses = user.warehouses.map((uw: any) =>({
            warehouseId: uw.warehouse.id,
            warehouseName: uw.warehouse.name,
            warehouseLocation:uw.warehouse.location,
            accessType: uw.accessType
        }))


        console.log("User found: ",user);
        console.log("User permissions: ",permissions);

        const UserPayload = {
        id: user.id,
        type: 'STAFF',
        role: user.role.name,
        permissions: permissions,
        trigram: user.trigram,
        gstin: null,
        warehouses: warehouses
        }
        
        const token = jwt.sign(UserPayload,"JWT_SECRET",{expiresIn:'7d'});
        console.log("✅ User authenticated and authorized");
        return res.status(200).json({message:'Success', user:UserPayload,token});

    } catch (error:any) {
        console.log("Error occured in loginWarehouseTrigram: ", error);
        return res.status(500).json({message:'Internal Server Error'})
        
    }
}

export const getInventoryStock = async(req:AuthRequest, res:Response) => {
    try {
        const { selectedWarehouseId } = req.query;
        console.log("Req query params: ", req.query);
        if(!selectedWarehouseId){
            console.log("Warehouse id is missing :", selectedWarehouseId);
            return res.status(403).json({ message:'Missing warehouseId to fetch.' })
        }
        const products = await (prisma as any).warehouseInventory.findMany({
            where:{
                warehouseId: Number(selectedWarehouseId)
            },
            include:{
                product:{
                    select:{
                        description:true,
                        brand:true,
                        family:true,
                        type:true

                    }
                }
            }
        });
        return res.status(200).json({ products, message: 'WarehouseInventory fetched successfully.' })
        
    } catch (error:any) {
        console.log('Error occured in getInventoryStock: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}


export const getInventoryProduct = async(req:AuthRequest, res:Response) => {
    try {
        const { selectedWarehouseId, productMn } = req.query;
        console.log("Req query params: ", req.query);
        if(!selectedWarehouseId || !productMn){
            console.log("Warehouse id and productMn are missing :", selectedWarehouseId);
            return res.status(403).json({ message:'Missing warehouseId and productMn to fetch.' })
        }
        const inventoryProduct = await (prisma as any).warehouseInventory.findUnique({
            where:{
                warehouseId_productMn:{
                    warehouseId:Number(selectedWarehouseId),
                    productMn:productMn as string
                }
            }
        });
        return res.status(200).json({ inventoryProduct, message: 'WarehouseInventory fetched successfully.' })
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProduct: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

export const getInventoryProductWithTransactions = async(req:AuthRequest, res:Response) => {
    try {
        const { selectedWarehouseId, productMn, page = 1, limit = 10 } = req.query;
        const pageNo = Number(page);
        const limitNo = Number(limit);
        const skip = (pageNo-1)*limitNo;
        console.log("Req query params: ", req.query);
        if(!selectedWarehouseId || !productMn){
            console.log("Warehouse id and productMn are missing :", selectedWarehouseId);
            return res.status(403).json({ message:'Missing warehouseId and productMn to fetch.' })
        }

        const inventoryProductPromise = prisma.warehouseInventory.findUnique({
            where:{
                warehouseId_productMn:{
                    warehouseId:Number(selectedWarehouseId),
                    productMn:productMn as string
                }
            },
            include:{
                product:true
            }
        });

        const whereClause: Prisma.InventoryTransactionWhereInput = {
            warehouseId:Number(selectedWarehouseId),
            productMn:productMn as string
        }


        const inventoryTransactionsPromise = prisma.inventoryTransaction.findMany({
            where:{
                ...whereClause                
            },
            orderBy:{
                createdAt:'desc',
            },
            take:limitNo,
            skip
        })

        const totalRowsPromise = prisma.inventoryTransaction.count({
            where:{
                ...whereClause
            }
        })

        const [inventoryProduct, inventoryTransactions, totalRows] = await Promise.all([
            inventoryProductPromise,
            inventoryTransactionsPromise,
            totalRowsPromise
        ])
        return res.status(200).json({
            inventoryProduct, 
            inventoryTransactions,
            totalPages: totalRows===0 ? 1 : Math.ceil(totalRows/limitNo),
            message: 'WarehouseInventory with transactions fetched successfully.'
        })
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProductWithTransactions: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

export const postInventoryTransaction = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const {productMn,warehouseId,type,qty,adjSign,reference} = req.body;
        console.log("Req body : ",req.body);
        console.log("Req query params: ", req.query);

        if(!warehouseId || !productMn){
            console.log("Warehouse id and productMn are missing :", warehouseId);
            return res.status(403).json({ message:'Missing warehouseId or productMn to fetch data.' })
        }

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
                        warehouseId:Number(warehouseId),
                        productMn:productMn
                    }
                }
            });
            // console.log("Reftched stock data: ", warehouseinventory);

            if(!warehouseinventory){
                throw new Error('Product not found in this warehouse.')
            }

            const physicalQty = warehouseinventory.physicalQty
            const reservedQty = warehouseinventory.reservedQty

            const qtyChange = deriveQtyChangeFromTxnType(type,qty, adjSign)
            
            const validation = validateInventoryTransaction( {type, qtyChange, physicalQty, reservedQty});

            console.log("Validation output: ", validation);

            if(!validation.isValid){
                console.log("Validation failed: ",validation.error)
                throw new Error(validation.error)
            }
            console.log("Qty Change: ", qtyChange);

            const { newPhysical, newReserved } = calculateInventoryInputs(type, physicalQty, reservedQty, qtyChange)

            console.log(`newPhysical: ${newPhysical} --- newReserver: ${newReserved}`)

            const updateWarehouseInventory = await tx.warehouseInventory.update({
                where:{
                    warehouseId_productMn:{
                        warehouseId:Number(warehouseId),
                        productMn:productMn as string
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
                    productMn,
                    qtyChange,
                    type,
                    reference,
                    createdBy:authUser?.trigram ?? null,
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

        // console.log("Transacion response: ", response);

        return res.status(200).json({ 
            updatedInventoryProduct: response.updateWarehouseInventory,
            createdTransaction: response.createdTransaction ,
            message: 'WarehouseInventory with transactions fetched successfully.'
        })
        
    } catch (error:any) {
        console.log('Error occured in postInventoryTransaction: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

