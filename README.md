## Desenvolvimento de Sistemas

- Projeto de Desenvolvimento de Sistemas feito para uma Barbearia
- Feito em [Next.js](https://nextjs.org/) 16.2.1
- Banco de dados em PostgreSQL

## Compras

Após criar as tabelas de compras e contas a pagar, aplique `database/compras_financeiro.sql`.
Essa migração adiciona motivo/data de cancelamento, rateio dos itens e vínculo das parcelas.
As novas compras geram contas a pagar na mesma transação do estoque. Compras anteriores
à migração não recebem parcelas retroativamente.

O rateio usa o valor dos produtos após os descontos individuais como base. Frete, seguro,
outras despesas e desconto geral entram proporcionalmente no custo de aquisição.
Os centavos restantes são distribuídos pelas maiores frações para fechar o total da nota.

Verificação: `node scripts/test-compras.mjs`. Exige `DATABASE_URL` local e cadastros ativos
de fornecedor, produto e condição com parcelas. Os registros do teste são desfeitos com rollback;
as sequências de identificação podem avançar.
