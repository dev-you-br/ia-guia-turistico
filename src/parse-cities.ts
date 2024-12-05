import * as fs from "fs"
import csv from "csv-parser"
import { z } from "zod"

const inputPath = "./resources/cidades.csv"
const outputPath = "./resources/cities.json"

console.info(`Parsing csv to json from ${inputPath} to ${outputPath}`)

const citySchema = z
  .object({
    NOME_DO_MUNICIPIO: z.string(),
    POPULACAO_ESTIMADA: z
      .string()
      .transform((p) => {
        const parenthesisIndex = p.indexOf("(")
        return parenthesisIndex > 0 ? p.substring(0, parenthesisIndex) : p
      })
      .pipe(z.coerce.number()),
  })
  .transform((c) => ({
    name: c.NOME_DO_MUNICIPIO,
    population: c.POPULACAO_ESTIMADA,
  }))

type City = z.infer<typeof citySchema>

const cities: Array<City> = []

fs.createReadStream(inputPath)
  .pipe(csv())
  .on("data", (data) => {
    cities.push(citySchema.parse(data))
  })
  .on("end", () => writeToFile(cities))

const writeToFile = (citiesToWrite: Array<City>) => {
  const citiesSorted = citiesToWrite.sort((a, b) => b.population - a.population)
  const output = JSON.stringify(citiesSorted, null, 2)
  fs.writeFile(outputPath, output, (err) => {
    if (err) throw err
  })
}

console.info(`Done parsing cities file at ${outputPath}`)
