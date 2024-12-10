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

Installe a dependencia `axior` para requesiões **http**:

```sh
npm install axios
```

Crie um diretorio `src`:

```sh
mkdir src
```

Instale a dependência `ts-stack/markdown` para converter markdown para html.

```sh
npm install @ts-stack/markdown --save
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

### Crie a Lista de Cidades Brasileiras em JSON

Implemente a funcionalidade que cria a lista de cidades em **json**.
Crie o arquivo [./src/make-cities.ts](./src/make-cities.ts).
Leia o arquivo [./resources/cities.csv](./resources/cities.csv) e converta em [./resources/cities.json](./resources/cities.json) mapeando os campos como abaixo:

| csv                | json           |
| ------------------ | -------------- |
| UF                 | region         |
| NOME_DO_MUNICIPIO  | name           |
| NOME_DO_MUNICIPIO  | nameNormalized |
| POPULACAO_ESTIMADA | population     |

Normalize o conteúdo do campo `nameNormalized`. Por example, a cidade `Sao Paulo` será nomalizado para `sao-paulo`.

Limite o resultado final para conter apenas as 10 cidades mais populosas.

```sh
npm run make-cities
```

### Inicie o Servidor Llama

Siga os passos do vido anterior ??? para iniciar o servidor Llama em sua máquina.

### Crie o Conteúdo Turístico das Cidades

Implemente a funcionalidade que cria o guia turístico de cada cidade.
Crie o arquivo [./src/make-cities-content.ts](./src/make-cities-content.ts).
Leia or arquivo [./resources/cities.json](./resources/cities.json) e gere um arquivo `./resources/content/city-x.html` para cada cidade.
Por exemplo, para a cidade `São Paulo`, escreva o arquivo `./resources/content/sao-paulo.html`.
Utilize o seguinte prompt de inteligência artificial:

```
Onde fica a cidade de {{CIDADE}}.
```

Crie o diretório `./resources/content`:

```sh
mkdir resources/content
```

Crie um script de execução:

```sh
npm run make-cities-content
```

### Criar um Layout Padrão

Manualmente, crie um layout padrão para o website.
Crie o arquivo [./resources/layout.html](./resources/layout.html) outros arquivos para o layout no diretório [./resources/layout](./resources/layout)
que conterão o esqueleto das páginas. O conteúdo será inserido posteriormente.

No `layout.html`, inclua:

- O texto `{{CONTENT}}` usado como uma marcação para ser substituído posteriormente.
- Link para a página `./index.html`

### Crie a Página Inicial

Implemente a funcionalidade que cria a página inicial.
Crie o arquivo [./src/make-index-page.ts](./src/make-index-page.ts).
Copie o [./resources/layout/](./resources/layout/) para [.docs/](./docs/).
Leia os arquivos
[./resources/cities.json](./resources/cities.json),
[./resources/layout/layout.html](./resources/layout/layout.html).
Crie uma lista de links para cada cidade e injete not layout. Por exemple: `<p><a href="sao_paulo.html">São Paulo</a></p>`.
Escreva o resultado em [./docs/index.html].

Crie o diretório `./docs`:

```sh
mkdir docs
```

Crie um script de execução:

```sh
npm run make-index-page
```

### Gerar Páginas das Cidades

Implemente a funcionalidade para criar as páginas das cidades.
Crie o arquivo [./src/make-cities-pages.html](./src/make-cities-pages.ts).
Leia os arquivos
[./resources/cities.json](./resources/cities.json),
[./resources/layout.html](./resources/layout.html).
Para cada cidade, leia o conteúdo correspondent do diretório [./resources/content](./resources/content/) e
injete no layout.
Escreva o resultado em [./docs/](./docs/).
Por exemplo, para a cidade `São Paulo`, crie o arquivo `./docs/sao-paulo.html`.

Crie um script de execucão:

```sh
npm run make-cities-pages
```

# Referencias

- [How to Setup a TypeScript + Node.js Project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)
