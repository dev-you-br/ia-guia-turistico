import { readFileSync, writeFile } from 'fs'
import axios from 'axios'
import { citiesSchema, City } from './schema.js'
import { zip } from 'lodash-es'

const citiesJsonPath = './resources/cities.json'
const outputDir = './resources/content'
const llamaUrl = 'http://localhost:11434/api/generate'
const promptTemplate = `
Crie um guia turístico para a cidade de {{NAME}}-{{REGION}}, Brasil, seguindo estas especificações:

Introdução:
Apresente a cidade, destacando sua importância histórica, cultural e arquitetônica.

Atrações turísticas:
Inclua cinco atrações turísticas, sendo algumas gratuitas e outras pagas (inclua o valor quando pagas).
Descreva brevemente cada atração, destacando o que a torna especial.

Restaurantes:
Inclua três restaurantes com pratos típicos da culinária local e regional.
Sendo dois restaurante acessível e um sofisticado.

Dicas práticas de viagem:
Aborde temas como a melhor época para visitar e transporte na cidade.

Formato de saída:
Não inclua elementos externos como <html>, <head> ou <body> pois o conteúdo será inserido em um página existente.
Retorne o conteúdo em HTML básico limitise apenas aos elementos de typografia: <h1>, <h2>, <h3><p>.

Aqui um examplo para a cidade de Brasília-DF para a sua referência:
<h1>Guia Turístico de Brasília - DF</h1>

<h2>Introdução</h2>
<p>Brasília, a capital do Brasil, é um exemplo singular de planejamento urbano e arquitetura modernista. Projetada por Lúcio Costa e Oscar Niemeyer, a cidade foi inaugurada em 1960 e é reconhecida como Patrimônio Mundial da UNESCO. Além de ser o centro administrativo do país, Brasília é um destino fascinante para os amantes de história, cultura e design arquitetônico.</p>

<h2>Atrações Turísticas</h2>

<h3>1. Praça dos Três Poderes</h3>
<p>Local onde estão situados o Palácio do Planalto, o Congresso Nacional e o Supremo Tribunal Federal. É um espaço emblemático que simboliza a harmonia entre os poderes da República. Entrada gratuita.</p>

<h3>2. Catedral Metropolitana de Brasília</h3>
<p>Com seu design futurista, a catedral projetada por Oscar Niemeyer é uma das obras mais impressionantes da cidade. O jogo de luzes no interior e os vitrais são de tirar o fôlego. Entrada gratuita.</p>

<h3>3. Parque da Cidade Sarah Kubitschek</h3>
<p>Um dos maiores parques urbanos do mundo, perfeito para caminhadas, passeios de bicicleta ou piqueniques. O espaço oferece lazer ao ar livre e contato com a natureza. Entrada gratuita.</p>

<h3>4. Memorial JK</h3>
<p>Este museu homenageia Juscelino Kubitschek, fundador de Brasília. Ele exibe objetos pessoais, fotos e documentos históricos, além de ser um marco arquitetônico importante. R$ 20,00 por pessoa.</p>

<h3>5. Torre de TV Digital</h3>
<p>A Torre de TV Digital oferece uma vista panorâmica espetacular de Brasília. Projetada por Oscar Niemeyer, é uma das melhores formas de admirar a cidade do alto. R$ 10,00 por pessoa</p>

<h2>Restaurantes</h2>

<h3>1. Restaurante Mangai</h3>
<p>Um dos mais populares da cidade, o Mangai oferece um buffet com pratos típicos do Nordeste, como carne de sol, baião de dois e macaxeira. Ótima relação custo-benefício.</p>

<h3>2. Casa do Cerrado</h3>
<p>Especializado em sabores regionais, este restaurante apresenta pratos como galinhada e peixes típicos da região. Ideal para experimentar a riqueza gastronômica do Cerrado. Valor acessível.</p>

<h3>3. Dom Francisco</h3>
<p>Conhecido por sua excelência gastronômica, o Dom Francisco oferece pratos como o famoso bacalhau e opções com ingredientes regionais, preparados com sofisticação e técnica apurada. Alto padrão.</p>

<h2>Dicas Práticas de Viagem</h2>

<h3>Melhor Época para Visitar</h3>
<p>A melhor época para conhecer Brasília é entre maio e setembro, durante a estação seca, quando os dias são ensolarados e agradáveis, ideais para passeios ao ar livre.</p>

<h3>Transporte</h3>
<p>Brasília foi planejada para o transporte de carros, mas há boas opções de transporte público, como ônibus e o metrô. Alugar um carro pode facilitar a locomoção, especialmente para visitar atrações mais distantes.</p>
` as const

console.log(`Reading cities from ${citiesJsonPath}. Writtig to ${outputDir}`)

const cities = citiesSchema.parse(
  JSON.parse(readFileSync(citiesJsonPath, 'utf-8')),
)

const llamas: Array<string> = []
for (const c of cities.slice(0, 1)) {
  const response = await generateLlama(c)
  llamas.push(response)
}

const citiesLlamasZip = zip(cities, llamas)
const citiesWithLlamas = citiesLlamasZip.map((z) => ({
  name: z[0]?.name ?? '',
  region: z[0]?.region ?? '',
  nameNormalized: z[0]?.nameNormalized ?? '',
  llama: z[1] ?? '',
}))

citiesWithLlamas.forEach((c) => {
  const cityContent = `<div>${c.llama}</div>`
  const outputPath = `${outputDir}/${c.nameNormalized}.html`
  writeFile(outputPath, cityContent, (err) => {
    if (err) throw err
  })
})

console.log('Done!')

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
  const llamaResult = response.data.response
    .replace('```html', '')
    .replace('```', '')
  console.log(`Llama responded with: ${llamaResult}`)
  return llamaResult
}
