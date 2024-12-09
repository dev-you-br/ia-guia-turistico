import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import { zip } from 'lodash-es'
import { citiesSchema, City } from './schema.js'

type CityWithLlama = {
  name: string
  nameNormalized: string
  llama: string
}

const citiesJsonPath = './resources/cities.json'
const outputDir = './resources/content'
const llamaUrl = 'http://localhost:11434/api/generate'
const promptTemplate = `
Crie um roteiro turístico bem detalhado e engajado para a cidade de {{NAME}}-{{REGION}}, Brasil, seguindo estas especificações:

Introdução:
Apresente a cidade destacando sua importância histórica e cultural.

Atrações turísticas:
Inclua cinco atrações turísticas, sendo algumas gratuitas e outras pagas (inclua o valor quando pagas). Descreva cada atração detalhadamente, abordando o que a torna especial e o que os visitantes podem esperar ao visitá-la.

Restaurantes:
Apresente três restaurantes, com uma variedade de estilos com pratos típicos da culinária local. Sendo dois restaurante acessíveis e um sofisticado.

Dicas de viagem:
Aborde temas como a melhor época para visitar e transporte na cidade.

Responda em html embutido sem os elementos <html>, <head> ou <body> pois o resultado será inserido em um página existente.
Responda em html apenas com os elementos: <h1>, <h2>, <h3> e <p>.
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

zip(cities, llamas).map(toCityWithLlama).forEach(writeContent)

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

function writeContent(city: CityWithLlama): void {
  const cityContent = `<div>${city.llama}</div>`
  const outputPath = `${outputDir}/${city.nameNormalized}.html`
  writeFileSync(outputPath, cityContent)
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

  if (!llamaResult.includes('<h1>') && !llamaResult.includes('<p>')) {
    console.log('Llama result does not look like html, re-generating')
    return await generateLlama(city)
  }

  if (llamaResult.includes('```html')) {
    return llamaResult.substring(
      llamaResult.indexOf('```html') + 7  ,
      llamaResult.lastIndexOf('```'),
    )
  }
  return llamaResult
}
