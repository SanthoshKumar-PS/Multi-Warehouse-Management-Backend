import { z } from 'zod'

export const loginSchema = z.object({
    body: z.object({
        trigram: z.string().min(3),
        password: z.string().min(10,"Password must have atleast 10 characters.")
    })
})
export type LoginBody = z.infer<typeof loginSchema>['body'];