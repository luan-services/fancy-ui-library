# Development Guide

Este documento é somente para desenvolvimento da biblioteca.
Ele explica como:

Instalar dependências
Buildar o TypeScript  
Rodar o servidor para testar componentes  

#  Instalação

Instale dependências:

```bash
npm install
```

# Build da library

A biblioteca é escrita em TypeScript dentro da pasta src/. Para gerar os arquivos JavaScript finais dentro de dist/, execute:

```bash
npm run build
```

Isso usa o tsup para:

- compilar .ts → .js

- erar tipagens .d.ts

- criar arquivos que serão publicados no npm

Sempre rode o build após alterar algo em src/.

# Rodando servidor de testes

O navegador não permite imports ES modules via file://, então precisamos de um servidor local.

Execute:

```bash
npx serve .
```

Em seguida, abra no navegador:

http://localhost:3000/tests/test.html