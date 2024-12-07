import { readFileSync, writeFile } from 'fs'
import axios from 'axios';
import { citiesSchema } from './schema.js';
import { zip } from 'lodash-es';

const citiesPath = './resources/cities.json'
const outputDir = './docs'
const llamaUrl = 'http://localhost:11434/api/generate';
const layoutPath = './resources/layout.html' as const


console.info(
  `Reading layout from ${layoutPath} and cities from ${citiesPath}. Writtig to ${outputDir}`,
)

const cities = citiesSchema.parse(JSON.parse(readFileSync(citiesPath, 'utf-8')))

const llamas: Array<string> = []

for (const c of cities.slice(0, 1)) {
  const response = await postLlama(c.name)
  llamas.push(response)
}

const citiesLlamasZip = zip(cities, llamas)

const citiesWithLlamas = citiesLlamasZip.map(z => ({name: z[0]?.name ?? '', llama: z[1] ?? ''}))

const layout = readFileSync(layoutPath, 'utf-8')
for (const c of citiesWithLlamas) {
  const cityContent = `<h1>${c.name}</h1><div>${c.llama}</div>`
  const outputPath = `${outputDir}/${c.name}`
  const output = layout.replace('{{CONTENT}}', cityContent)
  writeFile(outputPath, output, (err) => {
    if (err) throw err
  })
}

console.log('Done!')

async function postLlama(city: string): Promise<string> {
  const data = {
    model: "llama3.2",
    prompt: `Em qual estado fica ${city}?`,
    stream: false
  }
  const response = await axios.post(llamaUrl, data)
  return response.data.response
}