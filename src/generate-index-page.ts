import { readFileSync, writeFileSync } from 'fs'
import { citiesSchema } from './schema.js'
const citiesPath = './resources/cities.json' as const
const layoutPath = './resources/layout.html' as const
const outputPath = './docs/index.html' as const
const contentPlaceholder = '{{CONTENT}}' as const

console.info(
  `Reading layout from ${layoutPath}, and cities from ${citiesPath}. Writting to ${outputPath}`,
)

const citiesString = readFileSync(citiesPath, 'utf-8')
const cities = citiesSchema.parse(JSON.parse(citiesString))
const citiesPlaceholder = cities
  .slice(0, 10)
  .map((c) => `<p><a href="./${c.nameNormalized}.html">${c.name}</a><p>`)
  .join('\n')
const citiesDiv = `<div class="cities-links">${citiesPlaceholder}</div>`

const layout = readFileSync(layoutPath, 'utf-8')
const output = layout.replace(contentPlaceholder, citiesDiv)
writeFileSync(outputPath, output)

console.log('Done!')
