# AI Guia Turístico

Este site oferece guias turísticos para diversas cidades brasileiras, criado com a tecnologia de inteligência artificial (AI) do Llama, TypeScript e hospedado no GitHub Pages.

Neste projeto, vamos desenvolver tudo do zero. Será uma excelente oportunidade para aprimorarmos nossos conhecimentos e utilizarmos como base para futuros projetos.

## Criando um Repositório no GitHub

Crie um novo repositório no GitHub:

![Crie um Repositorio no Guithub](./doc/create-github-repository.png)

Agora clone am sua maquina:

```sh
git clone git@github.com:dev-you-br/ia-guia-turistico.git
```

## Preparar o projeto

Crie um arquivo `.nvmrc` para guardar a versao to Node que vamos utilizar no projeto.

```sh
node -v > .nvmrc
```

Outros desenvolvedores pode carregar a mesma versao do Node com:

```sh
nvm use
```

Inicialize o project com npm:

```sh
npm init -y
```

Instale typescript:

```sh
npm install typescript --save-dev
```

Instale Node types

```sh
npm install @types/node --save-dev
```

Instale os tipos recomendados pare Node

```sh
npm install --save-dev @tsconfig/node22
```

Instale configuracoes estritas

```sh
npm install --save-dev @tsconfig/strictest
```

Configure os tipos recomendados pare Node22

```sh
echo '{
  "extends": ["@tsconfig/strictest/tsconfig.json", "@tsconfig/node22/tsconfig.json"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}' > tsconfig.json
```

Crie um diretorio `src`:

```sh
mkdir src
```

Crie um `src/index.ts`

```sh
echo 'console.log("hello world")' > src/index.ts
```

Inclua um `start` script no seu [package.json](./package.json):

```json
{
  // ...
  "scripts": {
    "start": "tsc && node dist/index.js"
    // ...
  }
}
```

Rode o `start` script:

```sh
npm start

# hello world
```

## Setup prettier (optional)

```sh
npm install --save-dev --save-exact prettier
echo '{}\n' > .prettierrc
echo 'build
coverage
package-lock.json' > .prettierignore
```

## Desenvolvendo o Projeto

### Baixe a lista de cidades brasileiras

Baixe a lista de cidades brasileiras por populacao no site to [IBGE](https://ftp.ibge.gov.br/Estimativas_de_Populacao/Estimativas_2021/)

Limpe o arquivo no excel e remova o cabecalho, rodape, e exporte para `.csv` em `./resources/cities.csv`

Exemplo do arquivo `.csv`:

```csv
UF,COD_UF,COD_MUNICIPIO,NOME_DO_MUNICIPIO,POPULACAO_ESTIMADA
RO,11,00015,Alta Floresta D'Oeste,22516
RO,11,00023,Ariquemes,111148
RO,11,00031,Cabixi,5067
RO,11,00049,Cacoal,86416
```

### Converta a lista de cidades brasileiras para JSON

Crie um novo arquivo [./src/parse-cities.ts](./src/parse-cities.ts) e implemente a conversao do arquivo `./resources/cities.csv` para `./resources/cities.json`

```sh
npm install csv-parser
```

Adicione um script no [package.json](./package.json) para converter os arquivos:
```json
"parse-cities": "tsc && node dist/parse-cities.js"
```

Converta os arquivos:
```sh
npm run parse-cities
```

# Referencias

- [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
