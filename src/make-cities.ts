import csv from 'csv-parser'
import { createReadStream, writeFileSync } from 'fs'
import { z } from 'zod'
import { City } from './schema.js'

const inputPath = './resources/cities.csv' as const
const outputPath = './resources/cities.json' as const
const limit = 1 as const

console.log(
  `Reading from ${inputPath}. Writting to ${outputPath} with a limit of ${limit}`,
)

export const citySchema = z
  .object({
    NOME_DO_MUNICIPIO: z.string(),
    UF: z.string(),
    POPULACAO_ESTIMADA: z
      .string()
      .transform((p) => {
        const parenthesisIndex = p.indexOf('(')
        return parenthesisIndex > 0 ? p.substring(0, parenthesisIndex) : p
      })
      .pipe(z.coerce.number()),
  })
  .transform((c) => ({
    name: c.NOME_DO_MUNICIPIO,
    nameNormalized: c.NOME_DO_MUNICIPIO.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll(' ', '-')
      .toLocaleLowerCase(),
    region: c.UF,
    population: c.POPULACAO_ESTIMADA,
  }))

const cities: Array<City> = []
createReadStream(inputPath)
  .pipe(csv())
  .on('data', (data) => cities.push(citySchema.parse(data)))
  .on('end', () => parseToJsonFile(cities))

const parseToJsonFile = (citiesToWrite: Array<City>) => {
  const citiesSorted = citiesToWrite
    .sort((a, b) => b.population - a.population)
    .slice(0, limit)
  const output = JSON.stringify(citiesSorted, null, 2)
  writeFileSync(outputPath, output)
}

console.log(`Done!`)
