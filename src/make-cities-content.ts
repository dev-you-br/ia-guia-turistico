import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import { citiesSchema, City } from './schema.js'
import { Marked } from '@ts-stack/markdown'
const citiesJsonPath = './resources/cities.json'
const outputDir = './resources/content'
const llamaUrl = 'http://localhost:11434/api/generate'

const makePrompt = (city: City) => `
Escreva um roteiro turístico detalhado para a cidade de ${city.name}-${city.region} com a seguinte estrutura e formato:

# Introdução  
Apresente a cidade destacando:  
- Sua importância histórica e cultural.  
- Principais características geográficas.  
- Um resumo sobre o que a torna única e atrativa para visitantes.  

# Atrações  
Descreva cinco atrações turísticas, com um equilíbrio entre opções gratuitas e pagas.  
Para cada atração, inclua:  
1. Características ou histórias que a diferenciam indicando porque a atrção é especial.
2. Atividades, pontos de interesse, e experiências que o local oferece para o visitante entender o que esperar da atração.
3. Preços (se aplicável), horários de funcionamento, e dias de visitação.  

Cada atração deve ter três parágrafos bem elaborados.

---

# Restaurantes
Indique três restaurantes na cidade:  
- Dois restaurantes acessíveis com pratos típicos da culinária local, enfatizando sabores autênticos.  
- Um restaurante sofisticado que ofereça uma experiência gastronômica premium.  

Para cada restaurante, mencione:  
- Especialidades do cardápio.  
- Ambiente e estilo.  
- Faixa de preço e horários de funcionamento.  

---

# Dicas de Viagem
Inclua dicas úteis para os viajantes:  
1. Sugira a **melhor época para visitar** a cidade, considerando clima, eventos ou festivais.  
2. Inclua recomendações sobre vestuário, transporte e segurança.  
3. Dicas exclusivas para melhorar a experiência do visitante.  

---
Garanta a clareza, organização e detalhes em todas as seções.  
Responda utilizando o formato MARKDOWN.
`

console.log(`Reading cities from ${citiesJsonPath}. Writtig to ${outputDir}`)

const cities = citiesSchema.parse(
  JSON.parse(readFileSync(citiesJsonPath, 'utf-8')),
)

for (const city of cities) {
  const prompt = makePrompt(city)
  console.log(`Asking Llama: ${prompt}`)
  const content = await generateLlama(makePrompt(city))
  console.log(`Llama response: ${content}`)
  writeContent(city, content)
}

console.log('Done!')

async function generateLlama(prompt: string): Promise<string> {
  const data = {
    model: 'llama3.2',
    prompt,
    stream: false,
  }
  const response = await axios.post(llamaUrl, data)
  return parseLlama(response.data.response as string)
}

function parseLlama(text: string) {
  if (text.includes('```')) {
    return parseLlama(
      text.substring(text.indexOf('```') + 7, text.lastIndexOf('```')),
    )
  }
  return Marked.parse(text)
}

function writeContent(city: City, content: string): void {
  const outputPath = `${outputDir}/${city.nameNormalized}.html`
  writeFileSync(outputPath, content)
}
