import { readFileSync, writeFileSync } from 'fs'
import { z } from 'zod'

const citiesSchema = z.array(
  z
    .object({
      name: z.string(),
    })
    .transform((c) => ({
      name: c.name,
      path: c.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replaceAll(' ', '-')
        .toLocaleLowerCase()
        .concat('.html'),
    })),
)

const inputPath = './resources/cities.json'
const outputPath = './resources/index.html'
const layoutPath = './resources/layout.html'
const contentPlaceholder = '{{CONTENT}}'

console.info(
  `Generating index page. Reading layout from ${layoutPath} and cities from ${inputPath}. Writting to ${outputPath}`,
)

const citiesString = readFileSync(inputPath, 'utf-8')
const cities = citiesSchema.parse(JSON.parse(citiesString))
const citiesAnchor = cities.slice(0, 10)
  .map(c => `<p><a href="${c.path}">${c.name}</a><p>`)
  .join('\n')
const citiesDiv = `<div class="cities-links">${citiesAnchor}</div>`
const layout = readFileSync(layoutPath, 'utf-8')
const output = layout.replace(contentPlaceholder, citiesDiv)

writeFileSync(outputPath, output)