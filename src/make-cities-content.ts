import { readFileSync, writeFile } from 'fs'
import axios from 'axios'
import { citiesSchema, City } from './schema.js'
import { zip } from 'lodash-es'

type CityWithLlama = {
  name: string
  nameNormalized: string
  llama: string
}

const citiesJsonPath = './resources/cities.json'
const outputDir = './resources/content'
const llamaUrl = 'http://localhost:11434/api/generate'
const promptTemplate = `
Responda em html básico utilizando apenas os elementos de typografia: <h1>, <h2>, <h3> e <p>.

Crie um roteiro turístico bem detalhado e engajado para a cidade de {{NAME}}-{{REGION}}, Brasil, seguindo estas especificações:

Introdução:
Apresente a cidade destacando sua importância histórica e cultural.

Atrações turísticas:
Inclua cinco atrações turísticas, sendo algumas gratuitas e outras pagas (inclua o valor quando pagas). Descreva cada atração em detalhes, destacando o que a torna especial.

Restaurantes:
Inclua três restaurantes com pratos típicos da culinária local e regional. Sendo dois restaurante acessível e um sofisticado.

Dicas de viagem:
Aborde temas como a melhor época para visitar e transporte na cidade.

Responda em html embutido sem os elementos <html>, <head> ou <body> pois o resultado será inserido em um página existente.
Responda em html os elementos: <h1>, <h2>, <h3> e <p>.
` as const

console.log(`Reading cities from ${citiesJsonPath}. Writtig to ${outputDir}`)

const cities = citiesSchema.parse(
  JSON.parse(readFileSync(citiesJsonPath, 'utf-8')),
)

const llamas: Array<string> = []
for (const c of cities) {
  const response = await generateLlama(c)
  llamas.push(response)
}

zip(cities, llamas).map(toCityWithLlama).forEach(writeToFile)

console.log('Done!')

function toCityWithLlama(
  zip: [City | undefined, string | undefined],
): CityWithLlama {
  return {
    name: zip[0]?.name ?? '',
    nameNormalized: zip[0]?.nameNormalized ?? '',
    llama: zip[1] ?? '',
  }
}

function writeToFile(city: CityWithLlama): void {
  const cityContent = `<div>${city.llama}</div>`
  const outputPath = `${outputDir}/${city.nameNormalized}.html`
  writeFile(outputPath, cityContent, (err) => {
    if (err) throw err
  })
}

async function generateLlama(city: City): Promise<string> {
  console.log(
    `Asking Llama to generate content for ${city.name}-${city.region}`,
  )
  const prompt = promptTemplate
    .replace('{{NAME}}', city.name)
    .replace('{{REGION}}', city.region)

  const data = {
    model: 'llama3.2',
    prompt,
    stream: false,
  }
  const response = await axios.post(llamaUrl, data)
  const llamaResult = response.data.response as string
  console.log(`Llama responded with: ${llamaResult}`)
  if (llamaResult.includes('```html')) {
    return llamaResult.substring(
      llamaResult.indexOf('```'),
      llamaResult.lastIndexOf('```'),
    )
  }
  return llamaResult
}
