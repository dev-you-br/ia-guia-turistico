import * as fs from 'fs'

const inputPath = './resources/cidades.json'
const outputPath = './resources/index.html'

console.info(
  `Generating index page. Reading cities from ${inputPath} writting to ${outputPath}`,
)

const cities = fs.readFileSync(inputPath, 'utf-8')

console.log('cities', cities)
