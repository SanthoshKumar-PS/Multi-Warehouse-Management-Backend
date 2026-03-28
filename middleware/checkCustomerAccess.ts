import { Response, NextFunction } from "express";
import { AuthRequest } from "../utils/AuthRequest";
import { isCustomerUnderStaff } from "./isCustomerUnderStaff";
// TOREVIEW LOGIC
export const checkCustomerAccess =async (req:AuthRequest, res: Response, next: NextFunction) => {
    const requestedGstin = req.query.selectedGstin as string;
    const user = req.authUser;
    const company = req.query.company as string;
    if(!user){
        return res.status(404).json({message:'User Data Not Found.'})
    }
    console.log("Req query: ", req.query);

    if(user.type==='CUSTOMER'){
        if(user.gstin !== requestedGstin){
            return res.status(403).json({message:'Access denied'})
        }
        console.log("Customer access provided - customer")
        return next();
    }

    if(user.permissions.includes('view_all_customers')){
        console.log("Customer access provided - admin")
        return next();
    }

    if(user.permissions.includes('view_own_customers')){
        const allowed = await isCustomerUnderStaff(
            user.trigram!,
            requestedGstin,
            company
        );
        if (!allowed) {
            return res.status(403).json({ message: "Access denied" });
        }
        console.log("Customer access provided - salesman")
        return next();
    }

    return res.status(403).json({ message: "Access denied. Insufficient permissions." });
}