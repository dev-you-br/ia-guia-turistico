import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs'
import { citiesSchema } from './schema.js'
import path from 'path'
const layoutFileName = 'layout.html' as const
const citiesPath = './resources/cities.json' as const
const layoutDir = './resources/layout' as const
const layoutPath = `./resources/layout/${layoutFileName}` as const
const outputDir = './docs/' as const
const contentPlaceholder = '{{CONTENT}}' as const

console.log(
  `Reading cities from ${citiesPath}, layout from ${layoutPath}. Writting to ${outputDir}`,
)

console.log(`Copying directory ${layoutDir} to ${outputDir}`)
copyDirectory(layoutDir, outputDir)

const citiesString = readFileSync(citiesPath, 'utf-8')
const cities = citiesSchema.parse(JSON.parse(citiesString))
const citiesPlaceholder = cities
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => `<p><a href="./${c.nameNormalized}.html">${c.name}</a><p>`)
  .join('\n')
const citiesDiv = `
<h1>Cidades</h1>
<p>Descubra o melhor de cada destino! Escolha uma das cidades abaixo e explore o roteiro turístico exclusivo que preparamos para você.</p>
<div class="cities-links">
${citiesPlaceholder}
</div>`
const layout = readFileSync(layoutPath, 'utf-8')
const output = layout.replace(contentPlaceholder, citiesDiv)
const outputPath = `${outputDir}/index.html`
writeFileSync(outputPath, output)

console.log('Done!')

function copyDirectory(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src)
  for (let entry of entries) {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    copyFileSync(srcPath, destPath)
  }
}
