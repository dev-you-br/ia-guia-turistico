import { readFileSync, writeFile } from 'fs'
import axios from 'axios'
import { citiesSchema, City } from './schema.js'
import { zip } from 'lodash-es'

const citiesPath = './resources/cities.json'
const outputDir = './docs'
const llamaUrl = 'http://localhost:11434/api/generate'
const layoutPath = './resources/layout.html' as const
const promptTemplate = `
Crie um guia turístico para a cidade de {{NAME}}, {{REGION}}, Brasil, seguindo estas especificações:

Introdução:

Apresente a cidade, destacando sua importância histórica, cultural e arquitetônica.
Cinco seções de atrações turísticas:

Inclua uma variedade de atrações, sendo algumas gratuitas e outras pagas.
Descreva brevemente cada atração, destacando o que a torna especial.
Três seções com sugestões de restaurantes locais:

Liste opções com pratos típicos da culinária local e regional.
Inclua pelo menos uma opção acessível e outra sofisticada.
Dicas práticas de viagem:

Aborde temas como a melhor época para visitar, transporte na cidade e dicas de segurança.
Formato de saída:

Retorne o conteúdo em HTML básico sem scripts, styles ou classes adicionais.
Todo o conteúdo deve estar contido dentro de uma única <div>, pois será inserido em um layout externo.
Não inclua elementos externos como <html>, <head> ou <body>.


Aqui um examplo para a cidade de Brasília para a sua referencia:

<div>
    <h1>Guia Turístico de Brasília, DF, Brasil</h1>
    
    <h2>Introdução</h2>
    <p>Brasília, a capital do Brasil, é um marco de planejamento urbano e arquitetura moderna. Inaugurada em 1960, a cidade foi projetada por Lúcio Costa e ostenta obras icônicas de Oscar Niemeyer. Além de ser o centro político do país, Brasília é um polo cultural e artístico, com paisagens únicas, monumentos impressionantes e um céu de tirar o fôlego.</p>
    
    <h2>Atrações Turísticas</h2>
    
    <h3>1. Esplanada dos Ministérios</h3>
    <p>Um cartão-postal de Brasília, a Esplanada abriga edifícios governamentais alinhados em perfeita harmonia. A visita é gratuita, e os destaques incluem o Congresso Nacional, o Palácio do Planalto e o Supremo Tribunal Federal.</p>
    
    <h3>2. Catedral Metropolitana Nossa Senhora Aparecida</h3>
    <p>Projetada por Oscar Niemeyer, esta catedral é famosa por sua estrutura futurista e vitrais deslumbrantes. A entrada é gratuita, e o local proporciona momentos de reflexão e beleza artística.</p>
    
    <h3>3. Memorial JK</h3>
    <p>Este museu homenageia Juscelino Kubitschek, fundador de Brasília. Repleto de objetos pessoais e documentos históricos, o Memorial oferece uma imersão na história da capital. Ingressos: R$ 10 (valores sujeitos a alteração).</p>
    
    <h3>4. Parque da Cidade Sarah Kubitschek</h3>
    <p>Um dos maiores parques urbanos do mundo, perfeito para caminhadas, piqueniques e esportes ao ar livre. Entrada gratuita.</p>
    
    <h3>5. Lago Paranoá</h3>
    <p>Um ponto de encontro para quem busca relaxar ou praticar esportes aquáticos. É possível alugar barcos ou fazer passeios de catamarã. Preços variam conforme a atividade.</p>
    
    <h2>Restaurantes</h2>
    
    <h3>1. Mangai</h3>
    <p>Um restaurante especializado em culinária nordestina. Oferece pratos típicos como carne de sol com mandioca e macaxeira gratinada. Uma experiência gastronômica única em um ambiente acolhedor.</p>
    
    <h3>2. Restaurante Xique Xique</h3>
    <p>Famoso pela carne de sol, este é um dos locais mais acessíveis para saborear pratos regionais em Brasília. Ideal para refeições em família ou com amigos.</p>
    
    <h3>3. Dom Francisco</h3>
    <p>Uma opção sofisticada que combina ingredientes locais com alta gastronomia. Destaque para os pratos à base de peixes do cerrado e uma carta de vinhos impressionante.</p>
    
    <h2>Dicas Práticas de Viagem</h2>
    
    <h3>Melhor Época para Visitar</h3>
    <p>A estação seca, entre maio e setembro, é ideal para explorar a cidade e aproveitar o céu azul típico da região.</p>
    
    <h3>Transporte</h3>
    <p>Brasília foi projetada para carros, mas aplicativos de transporte e táxis são eficientes. A cidade também conta com uma boa rede de ônibus para locomoção.</p>
</div>
` as const

console.info(
  `Reading layout from ${layoutPath} and cities from ${citiesPath}. Writtig to ${outputDir}`,
)

const cities = citiesSchema.parse(JSON.parse(readFileSync(citiesPath, 'utf-8')))

const llamas: Array<string> = []

for (const c of cities.slice(0, 1)) {
  const response = await postLlama(c)
  llamas.push(response)
}

const citiesLlamasZip = zip(cities, llamas)

const citiesWithLlamas = citiesLlamasZip.map((z) => ({
  name: z[0]?.name ?? '',
  region: z[0]?.region ?? '',
  nameNormalized: z[0]?.nameNormalized ?? '',
  llama: z[1] ?? '',
}))

const layout = readFileSync(layoutPath, 'utf-8')
for (const c of citiesWithLlamas) {
  const cityContent = `<h1>${c.name}</h1><div>${c.llama}</div>`
  const outputPath = `${outputDir}/${c.nameNormalized}.html`
  const output = layout.replace('{{CONTENT}}', cityContent)
  writeFile(outputPath, output, (err) => {
    if (err) throw err
  })
}

console.log('Done!')

async function postLlama(city: City): Promise<string> {
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
  console.log(`Llama responded with: ${llamaResult}`)
  return llamaResult
}
