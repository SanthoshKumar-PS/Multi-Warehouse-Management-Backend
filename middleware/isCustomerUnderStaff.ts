import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export const isCustomerUnderStaff = async (trigram:string,gstin:string,company:string):Promise<boolean> => {
    const customer_company = await prisma.company.findFirst({
        where:{
            gstin,
            sales:trigram,
            company_name:company
        },
        select:{
            id:true
        }
    });

    return !!customer_company
}