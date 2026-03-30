import { z } from 'zod'

export const loginSchema = z.object({
    body: z.object({
        trigram: z.string().trim().length(3,'Trigram should be of length 3.')
            .transform(val => val.toUpperCase()),
        password: z.string().trim().min(3,"Password must have atleast 3 characters.")
    })
})
export type LoginBody = z.infer<typeof loginSchema>['body'];