import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import { citiesSchema, City } from './schema.js'
const citiesJsonPath = './resources/cities.json'
const outputDir = './resources/content'
const llamaUrl = 'http://localhost:11434/api/generate'

const proptResponseInHtml = `Responda em HTML.
Utilize apenas os elementos: <h1>, <h2> e <p>.
Exclua elementos externos como <html>, <head>, ou <body>, pois o conteúdo será inserido em uma página existente.`

console.log(`Reading cities from ${citiesJsonPath}. Writtig to ${outputDir}`)

const cities = citiesSchema.parse(
  JSON.parse(readFileSync(citiesJsonPath, 'utf-8')),
)

for (const city of cities) {
  const content: Array<string> = []
  content.push(await generateIntro(city))
  content.push(await generateAtractions(city))
  content.push(await generateRestaurants(city))
  content.push(await generateHints(city))
  writeContent(city, content.join('\n'))
}

console.log('Done!')

async function generateIntro(city: City) {
  const prompt = `Escreva uma introdução de dois parágrafos para a cidade de ${city.name}-${city.region} para um roteiro turístico.
  ${proptResponseInHtml}`
  return await generateLlamaRetry(prompt)
}

async function generateAtractions(city: City) {
  const prompt = `Descreva cinco atrações turísticas para de ${city.name}-${city.region}, sendo algumas gratuitas e outras pagas.
  Escreva três parágrafos: primeiro descreve o que a torna especial; segundo o que os visitantes podem esperar ao visitá-la; terceiro se a atração é gratuíta ou paga e qual os dias e horário para visitação.
  ${proptResponseInHtml}`
  return await generateLlamaRetry(prompt)
}

async function generateRestaurants(city: City) {
  const prompt = `Descreva três restaurantes para a cidade de ${city.name}-${city.region}, com uma variedade de estilos.
  Inclua dois restaurantes acessíveis, com pratos típicos da culinária local, e um restaurante sofisticado que ofereça uma experiência mais requintada.
  ${proptResponseInHtml}`
  return await generateLlamaRetry(prompt)
}

async function generateHints(city: City) {
  const prompt = `Descreva dicas de viagem para a cidade de ${city.name}-${city.region} para um roteiro turístico.
  Sugira a melhor época para visitar a cidade, considerando clima, eventos ou festivais especiais.
  Dê dicas sobre transporte local.
  ${proptResponseInHtml}`
  return await generateLlamaRetry(prompt)
}

async function generateLlamaRetry(prompt: string) {
  const llama = await generateLlama(prompt)
  const llamaClean = clearLlama(llama)

  if (
    llamaClean.includes('html') ||
    !llamaClean.includes('<h1>') ||
    !llamaClean.includes('<p>')
  ) {
    console.log('Llama result does not look like the html we want.', llamaClean)
    return await generateLlama(prompt)
  }
  return llama
}

function clearLlama(text: string) {
  if (text.includes('```html')) {
    return clearLlama(
      text.substring(text.indexOf('```html') + 7, text.lastIndexOf('```')),
    )
  }
  if (text.includes('<body>')) {
    return clearLlama(
      text.substring(text.indexOf('<body>') + 6, text.indexOf('</body>')),
    )
  }
  return text
}

async function generateLlama(prompt: string): Promise<string> {
  console.log(
    `Asking Llama to generate content for:
    ${prompt}`,
  )
  const data = {
    model: 'llama3.2',
    prompt,
    stream: false,
  }
  const response = await axios.post(llamaUrl, data)
  return response.data.response as string
}

function writeContent(city: City, content: string): void {
  const outputPath = `${outputDir}/${city.nameNormalized}.html`
  writeFileSync(outputPath, content)
}
