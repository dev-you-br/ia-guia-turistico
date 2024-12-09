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
<p>A Praça dos Três Poderes, localizada no coração de Brasília, é um dos marcos mais emblemáticos da capital do Brasil. Projetada pelo renomado arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, a praça simboliza a harmonia entre os três poderes da República: Executivo, Legislativo e Judiciário. Rodeada por edificações icônicas, como o Palácio do Planalto, o Congresso Nacional e o Supremo Tribunal Federal, a praça reflete a arquitetura modernista que define Brasília e oferece uma experiência única para os visitantes interessados em história, arte e política.</P

<p>Ao caminhar pela praça, é impossível não notar as obras de arte que enriquecem o espaço, como a famosa escultura Os Guerreiros, de Bruno Giorgi, também conhecida como "Os Candangos", que homenageia os trabalhadores que construíram Brasília. Outro destaque é a monumental bandeira do Brasil hasteada no mastro de 100 metros, visível de diversos pontos da cidade. Além disso, o Panteão da Pátria e da Liberdade Tancredo Neves convida os visitantes a explorar exposições que celebram personalidades e eventos marcantes da história brasileira.</p>

<p>O local conta com guias disponíveis para fornecer informações detalhadas sobre a história e o significado dos edifícios e monumentos. À noite, a iluminação realça ainda mais a beleza da arquitetura, tornando a experiência inesquecível. Para quem deseja aprender mais sobre o Brasil enquanto desfruta de uma vista privilegiada, este é um passeio indispensável.</p>

<p>A visita à Praça dos Três Poderes é gratuita e pode ser realizada em qualquer dia da semana.</p>

<h3>2. Catedral Metropolitana de Brasília</h3>
<p>A Catedral Metropolitana de Brasília, também conhecida como Catedral de Nossa Senhora Aparecida, é um dos símbolos mais impressionantes da capital brasileira e um exemplo icônico da arquitetura modernista de Oscar Niemeyer. Inaugurada em 1970, a catedral encanta visitantes com sua estrutura única, composta por 16 colunas de concreto em forma hiperboloide, que se assemelham a mãos erguidas ao céu. Este design inovador, combinado com sua iluminação natural proporcionada pelos vitrais coloridos projetados por Marianne Peretti, cria uma atmosfera de serenidade e contemplação.</p>

<p>Ao entrar na catedral, os visitantes são recebidos por um espetáculo visual. Os vitrais, que se estendem do teto ao chão, filtram a luz do sol em tons vibrantes, iluminando o interior com cores deslumbrantes. A catedral também abriga esculturas de anjos suspensos no teto, criadas por Alfredo Ceschiatti, que parecem flutuar em um ambiente celestial. No altar, a simplicidade moderna contrasta com a grandiosidade do espaço, convidando à introspecção e à paz espiritual.</p>

<p>Localizada no Eixo Monumental, a catedral é de fácil acesso e pode ser visitada diariamente. Seja para admirar sua arquitetura singular, apreciar a arte ou vivenciar um momento de tranquilidade, a Catedral Metropolitana de Brasília é uma parada imperdível para quem visita a cidade.</p>

<p>A entrada é gratuita, e o local frequentemente recebe eventos religiosos e culturais que destacam sua importância como centro espiritual e turístico.<p>

<h3>3. Parque da Cidade Sarah Kubitschek</h3>
<p>O Parque da Cidade Sarah Kubitschek, é um dos maiores parques urbanos do mundo, com mais de 4 milhões de metros quadrados de área. Ideal para quem busca lazer, esporte ou contato com a natureza, o parque oferece uma ampla variedade de atividades e espaços, como pistas de caminhada, ciclovias, quadras esportivas, e áreas para piqueniques. Seu nome homenageia Sarah Kubitschek, esposa do ex-presidente Juscelino Kubitschek, e reflete a importância do espaço para a qualidade de vida dos moradores da capital.</p>

<p>Entre os principais atrativos do parque estão o Nicolândia Center Park, um parque de diversões com atrações para todas as idades, e os diversos lagos artificiais, que criam um ambiente relaxante para visitantes. O local também conta com playgrounds, campos de futebol, churrasqueiras e até um espaço exclusivo para práticas de aeromodelismo e skate. Os amantes de esportes podem aproveitar as pistas de corrida e ciclismo bem conservadas, enquanto aqueles que preferem tranquilidade podem explorar os jardins e bosques.</p>

<p>Parque da Cidade é um destino perfeito para famílias, esportistas e turistas que desejam escapar da agitação urbana. Seja para um passeio descontraído, para praticar exercícios ou simplesmente para aproveitar um momento ao ar livre, este é um espaço que combina lazer e natureza, sendo um ponto obrigatório para quem visita Brasília.</p>

<p>Aberto diariamente e com entrada gratuita.</p>

<h3>4. Memorial JK</h3>
<p>O Memorial JK é um dos monumentos mais emblemáticos da capital, dedicado à memória de Juscelino Kubitschek, o visionário fundador da cidade e ex-presidente do Brasil. Projetado por Oscar Niemeyer e inaugurado em 1981, o memorial combina arquitetura modernista com história, oferecendo aos visitantes uma experiência única que conecta o passado e o presente do país. Sua estrutura imponente, marcada por uma torre com a estátua de JK saudando a cidade, é um ponto de destaque no horizonte do Eixo Monumental.</p>

<p>No interior do memorial, os visitantes podem explorar uma rica coleção de objetos pessoais, fotografias, documentos históricos e presentes diplomáticos recebidos por Juscelino durante sua vida pública. Um dos momentos mais impactantes da visita é o espaço onde repousa o corpo de JK, em uma câmara de mármore iluminada suavemente, que transmite uma atmosfera de respeito e contemplação. O acervo detalha não apenas a trajetória política do presidente, mas também sua contribuição para a construção de Brasília, considerada um dos maiores projetos urbanísticos do século XX.</p>

<p>Além de ser um espaço de aprendizado, o local proporciona uma vista privilegiada da cidade e seus arredores, tornando a visita ainda mais memorável. Com sua combinação de arquitetura, cultura e história, o memorial é uma verdadeira homenagem ao legado de Juscelino Kubitschek.</p>

<p>Aberto de Terça a Domingo, de 9h às 18h. Valor do ingresso: Inteira R$ 10,00 e meia-entrada para estudantes e idosos.<p>

<h3>5. Parque Nacional de Brasília (Água Mineral)</h3>
</p>O Parque Nacional de Brasília, popularmente conhecido como Água Mineral, é um oásis de natureza preservada a poucos minutos do centro da capital. Criado em 1961, o parque ocupa uma área de mais de 42 mil hectares, protegendo importantes ecossistemas do Cerrado e diversas nascentes de água cristalina. Além de ser um refúgio para a fauna e flora nativas, o local é uma das principais opções de lazer ao ar livre para moradores e turistas que desejam relaxar e se conectar com a natureza.</p>

<p>Um dos principais atrativos do parque são suas piscinas naturais, abastecidas por águas que brotam diretamente das nascentes. Perfeitas para um banho refrescante, essas piscinas são rodeadas por áreas verdes e oferecem infraestrutura básica, como vestiários e quiosques. Para os mais aventureiros, o parque também possui trilhas ecológicas, como a Trilha da Capivara e a Trilha Cristal Água, que permitem explorar a biodiversidade do Cerrado e, com sorte, avistar animais como macacos, tatus e até tamanduás.</p>

<p>É recomendável visitar cedo para aproveitar melhor as atrações e evitar horários de maior movimento. Combinando lazer, preservação ambiental e contato direto com a natureza, o Água Mineral é um destino imperdível para quem busca tranquilidade e aventura em um só lugar. Lembre de trazer um bloqueador solar.</p>

<p>Aberto de terça a domingo, o Parque Nacional de Brasília é acessível com pagamento de uma taxa simbólica.</p>

<h2>Restaurantes</h2>

<h3>1. Restaurante Mangai</h3>
<p>O Restaurante Mangai é um destino imperdível para quem deseja vivenciar a rica e autêntica gastronomia nordestina em um ambiente acolhedor e cheio de charme. Com uma decoração que remete às raízes culturais do sertão brasileiro, o restaurante combina elementos rústicos e regionais, como móveis de madeira, utensílios típicos e peças artesanais. A vista privilegiada do Lago Paranoá, presente em algumas áreas do restaurante, torna a experiência ainda mais especial, proporcionando um ambiente relaxante e perfeito tanto para encontros em família quanto para reuniões de negócios.</p>

<p>No cardápio, o Mangai oferece uma impressionante variedade de pratos típicos do Nordeste, incluindo clássicos como carne de sol com queijo coalho, baião de dois, feijão-verde, e sobremesas como bolo de rolo e cartola. O sistema self-service permite que os visitantes explorem diversas opções em uma única refeição, sempre com ingredientes frescos e sabores autênticos. Não deixe de experimentar as tapiocas feitas na hora e os sucos naturais com frutas regionais. O Mangai é uma celebração da cultura e dos sabores nordestinos em pleno coração da capital federal.</p>

<h3>2. Casa do Cerrado</h3>
<p>A Casa do Cerrado é um restaurante que celebra a diversidade e a autenticidade dos sabores típicos do bioma Cerrado, trazendo para a mesa a riqueza cultural e gastronômica da região. Com um ambiente que reflete a beleza natural do cerrado brasileiro, o espaço é decorado com madeira de reflorestamento, tons terrosos e artesanato local, criando uma atmosfera acolhedora e sustentável. A localização privilegiada e o atendimento caloroso fazem do restaurante um ponto de encontro para os apreciadores de uma culinária genuína e cheia de personalidade.</p>

</p>O cardápio destaca ingredientes locais, como pequi, baru, cagaita e buriti, transformando-os em pratos únicos e deliciosos. Experimente especialidades como arroz com pequi, galinhada e carnes grelhadas acompanhadas de farofa de baru. Para adoçar, as sobremesas incluem delícias como mousse de buriti e pudim de leite com calda de cagaita. O restaurante também oferece uma seleção de sucos naturais e drinks artesanais que exaltam o frescor das frutas do cerrado. É um convite para explorar a identidade cultural e os sabores surpreendentes desse bioma único.</p>

<h3>3. Dom Francisco</h3>
<p>O Restaurante Dom Francisco é um renomado endereço para quem busca uma experiência gastronômica sofisticada e um ambiente elegante. Famoso por sua cozinha contemporânea e focada na qualidade, o restaurante oferece uma excelente seleção de pratos, com destaque para as carnes nobres e peixes frescos. Com uma decoração refinada e iluminação intimista, o Dom Francisco é perfeito tanto para jantares românticos quanto para celebrações especiais, garantindo um ambiente acolhedor e de alto padrão. O atendimento impecável e a atenção aos detalhes fazem cada refeição ser memorável.</p>

<p>O cardápio do Dom Francisco é uma verdadeira experiência para os sentidos, destacando-se pela combinação de ingredientes frescos e técnicas culinárias de vanguarda. Os cortes de carnes, como o filé mignon e a picanha, são servidos com acompanhamentos criativos e deliciosos. Para os amantes de frutos do mar, o restaurante oferece pratos como camarões grelhados e peixes da região, sempre preparados com toque de sofisticação. As sobremesas, como o tiramisù e o pudim de leite, completam a experiência de maneira doce e delicada. Com um serviço de alta qualidade e uma carta de vinhos cuidadosamente selecionada, o Dom Francisco é um local ideal para um jantar inesquecível.</p>

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
for (const c of cities) {
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
