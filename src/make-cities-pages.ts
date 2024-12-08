import { readFileSync, writeFileSync } from 'fs'
import { citiesSchema } from './schema.js'

const citiesPath = './resources/cities.json'
const layoutPath = './resources/layout/layout.html' as const
const contentDir = './resources/content' as const
const outputDir = './docs'

console.log(
  `Reading cities from ${citiesPath}, layout from ${layoutPath} and content from ${contentDir}. Writtig to ${outputDir}`,
)

const cities = citiesSchema.parse(JSON.parse(readFileSync(citiesPath, 'utf-8')))

const layout = readFileSync(layoutPath, 'utf-8')
cities
  .map((c) => {
    const contentPath = `${contentDir}/${c.nameNormalized}.html`
    const content = readFileSync(contentPath, 'utf-8')
    return { ...c, content }
  })
  .forEach((c) => {
    const outputPath = `${outputDir}/${c.nameNormalized}.html`
    const output = layout.replace('{{CONTENT}}', c.content)
    writeFileSync(outputPath, output)
  })

console.log('Done!')
