# IA Guia Turístico

Neste projeto, vamos desenvolver tudo do zero. Será uma excelente oportunidade para aprimorarmos nossos conhecimentos e utilizarmos como base para futuros projetos.

Vamos construir um site que oferece guias turísticos para diversas cidades brasileiras, criado com a tecnologia de inteligência artificial (IA) do Llama, TypeScript e hospedado no GitHub Pages.

## Criando um Repositório no GitHub

Crie um novo repositório no GitHub:

![Crie um Repositorio no Guithub](./resources/create-github-repository.png)

Clone em sua máquina:

```sh
git clone git@github.com:dev-you-br/ia-guia-turistico.git
```

## Preparar o Projeto

Crie um arquivo `.nvmrc` e guarde a versão do Node que vamos utilizar no projeto:

```sh
node -v > .nvmrc
```

Outros desenvolvedores podem carregar a mesma versão do Node com:

```sh
nvm use
```

Inicialize o projeto:

```sh
npm init -y
```

Instale Typescript:

```sh
npm install typescript --save-dev
```

Instale Node types:

```sh
npm install @types/node --save-dev
```

Instale Typescript tipos recomendados para Node:

```sh
npm install --save-dev @tsconfig/node22
```

Instale configurações estritas:

```sh
npm install --save-dev @tsconfig/strictest
```

Configure os tipos recomendados pare Node22:

```sh
echo '{
  "extends": ["@tsconfig/strictest/tsconfig.json", "@tsconfig/node22/tsconfig.json"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}' > tsconfig.json
```

Installe a dependencia `csv-parser` para ler arquivos **csv**:

```sh
npm install csv-parser
```

Crie um diretorio `src`:

```sh
mkdir src
```

## Setup prettier (optional)

Instale `prettier`:

```sh
npm install --save-dev --save-exact prettier
```

Configure o `prettier`:

```
echo '{
  "semi": false,
  "singleQuote": true
}
' > .prettierrc

echo 'build
coverage
package-lock.json
ollama/' > .prettierignore
```

## Desenvolvendo o Projeto

### Baixe a Lista de Cidades Brasileiras

Baixe a lista de cidades brasileiras por população no site do [IBGE](https://ftp.ibge.gov.br/Estimativas_de_Populacao/Estimativas_2021/)

Limpe o arquivo no Excel, remova cabeçalhos e rodapés, e exporte para .csv em [./resources/cities.csv](./resources/cities.csv).

Exemplo do arquivo:

```csv
UF,COD_UF,COD_MUNICIPIO,NOME_DO_MUNICIPIO,POPULACAO_ESTIMADA
RO,11,00015,Alta Floresta D'Oeste,22516
RO,11,00023,Ariquemes,111148
RO,11,00031,Cabixi,5067
RO,11,00049,Cacoal,86416
```

### Converter a Lista de Cidades Brasileiras para JSON

Crie um arquivo [./src/parse-cities.ts](./src/parse-cities.ts).

Implemente a conversao do arquivo `./resources/cities.csv` para `./resources/cities.json` mapeando os campos como abaixo:

| csv                | json           |
| ------------------ | -------------- |
| UF                 | region         |
| NOME_DO_MUNICIPIO  | name           |
| NOME_DO_MUNICIPIO  | nameNormalized |
| POPULACAO_ESTIMADA | population     |

Normalize o conteúdo do campo `nameNormalized`. Por example, a cidade `Sao Paulo` será nomalizado para `sao-paulo`.

Limite o resultado final para conter apenas as 10 cidades mais populosas.

Crie um script para converter os arquivos:

```sh
npm run parse-cities
```

### Gerar um layout padrao

Crie um novo arquivo [./resources/layout.html](./resources/layout.html) e [./resources/styles.css](./resources/styles.css),
que conterão o esqueleto das páginas. O conteúdo será inserido posteriormente.

No `layout.html`, inclua:

- O texto `{{CONTENT}}` usado como uma marcação para ser substituído posteriormente.
- Link para a página `./index.html`

### Gerar Página Inicial: index.html

Implemente a funcionalidade que criará a página inicial, salvando o resultado em [./docs/index.html](./docs/index.html).
Leia os arquivos [./resources/layout.html](./resources/layout.html) e [./resources/cities.json](./resources/cities.json).
Transforme as cidades em `cities.json` em links para suas respectivas páginas.
Por exemplo, a cidade `São Paulo` terá um link para a página `./sao-paulo.html`.

Crie o diretório `./docs/`:

```sh
mkdir docs
```

Crie um script para gerar a página inicial:

```sh
npm run generate-index-page
```

### Gerar Páginas das Cidades: city-x.html

Implemente a funcionalidade para gerar as páginas das cidades.
Siga os passos deste guia para criar um servidor Llama rodando localmente: ?????

Utilize o seguinte prompt de IA para cada cidade:

```
Onde fica a cidade de {{CIDADE}}.
```

Cada cidade deve ser gerada em um arquivo HTML no diretório `./docs`.
Por exemplo, para a cidade `São Paulo`, gere o arquivo `./docs/sao-paulo.html`.

Crie um script para gerar as páginas das cidades:

```sh
npm run generate-cities-pages
```

```sh
npm install axios
```

# Referencias

- [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
