## Desenvolvimento de Sistemas

- Projeto de Desenvolvimento de Sistemas feito para uma Barbearia
- Feito em [Next.js](https://nextjs.org/) 16.4.5, React 19.3.1 e Tailwind CSS 4.3.5
- Banco de dados em PostgreSQL

Use Node.js 24 LTS e instale as dependências com `npm ci`.

Validação: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
Os testes de `npm test` não acessam o banco. Com o servidor iniciado, execute
`node scripts/test-cadastro-popups.mjs` para verificar os cadastros.

O tema do Tailwind fica em `app/globals.css`, e o PostCSS usa `@tailwindcss/postcss`.

TypeScript 6.0.3 e ESLint 9.39.5 são as versões compatíveis com os plugins atuais.
O `typescript-eslint` ainda exige TypeScript abaixo de 6.1, e os plugins React,
import e acessibilidade do ESLint ainda declaram suporte até ESLint 9.
Os tipos do Node.js acompanham a versão 24 usada no desenvolvimento.
