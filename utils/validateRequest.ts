import { ZodType } from 'zod'
import ApiError from './ApiError'
export function validateRequest<T>(
    schema: ZodType<T>,
    data:unknown
): T{
    const result = schema.safeParse(data);
    if(!result.success){
        const firstError = result.error.issues[0]
        console.log("Error message is : ",firstError.message);
        console.log("Zod Validation Error: ", result);
        throw new ApiError(400,firstError.message)
    }
    console.log("Zod Validation Success: ",result);
    return result.data
}