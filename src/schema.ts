import { z } from 'zod'

export const citySchema = z.object({
  name: z.string(),
  nameNormalized: z.string(),
  region: z.string(),
  population: z.number(),
})

export const citiesSchema = z.array(citySchema)

export type City = z.infer<typeof citySchema>
