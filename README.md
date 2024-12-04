# AI Guia Turístico
Este site oferece guias turísticos para diversas cidades brasileiras, criado com a tecnologia de inteligência artificial (AI) do Llama, TypeScript e hospedado no GitHub Pages.

Neste projeto, vamos desenvolver tudo do zero. Será uma excelente oportunidade para aprimorarmos nossos conhecimentos e utilizarmos como base para futuros projetos.

## Criando um Repositório no GitHub
Crie um novo repositório no GitHub:

![Crie um Repositorio no Guithub](./doc/create-github-repository.png)

Agora clone am sua maquina:

```bash
git clone git@github.com:dev-you-br/ia-guia-turistico.git
```
## Preparar o projeto

Crie um arquivo `.nvmrc` para guardar a versao to Node que vamos utilizar no projeto.
```bash
node -v > .nvmrc
```

Outros desenvolvedores pode carregar a mesma versao do Node com:
```bash
nvm use
```

Inicialize o project com npm:
```bash
npm init -y
```

Instale typescript:
```bash
npm install typescript --save-dev
```

Instale Node types
```bash
npm install @types/node --save-dev
```

Instale os tipos recomendados pare Node
```bash
npm install --save-dev @tsconfig/node22
```

Configure os tipos recomendados pare Node22
```bash
echo '{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}' > tsconfig.json
```

Crie um diretorio `src`:
```bash
mkdir src
```

Crie um `src/index.ts`
```bash
echo 'console.log("hello world")' > src/index.ts
```

Inclua um `start` script no seu [package.json](./package.json):
```json
{
// ...
  "scripts": {
    "start": "tsc && node dist/index.js",
// ...
  }
}
```

Rode o `start` script:
```sh
npm start

# hello world
```

# Referencias

* [How to Setup a TypeScript + Node.js Project](
https://khalilstemmler.com/blogs/typescript/node-starter-project/)