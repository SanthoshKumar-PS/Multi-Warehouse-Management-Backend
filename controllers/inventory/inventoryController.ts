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
