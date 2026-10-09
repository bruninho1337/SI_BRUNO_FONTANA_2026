## Desenvolvimento de Sistemas

- Projeto de Desenvolvimento de Sistemas feito para uma Barbearia
- Feito em [Next.js](https://nextjs.org/) 16.2.1
- Banco de dados em PostgreSQL

## Compras

Após criar as tabelas de compras e contas a pagar, aplique `database/compras_financeiro.sql`.
Essa migração adiciona motivo/data de cancelamento, rateio dos itens e vínculo das parcelas.
As novas compras geram contas a pagar na mesma transação do estoque. Compras anteriores
à migração não recebem parcelas retroativamente.

Em bancos existentes, aplique também `database/compras_remover_desconto_geral.sql`.
Essa migração remove o desconto geral da compra e preserva os totais, rateios e contas
a pagar já registrados. Os descontos individuais dos itens continuam disponíveis.

O rateio usa o custo unitário dos produtos como base. Frete, seguro e outras despesas
entram proporcionalmente no custo de aquisição, com exibição do rateio por unidade.
Parcelas com o mesmo percentual recebem o mesmo valor, mantendo a soma da nota.
Se o total não permitir essa divisão em centavos, a gravação é bloqueada com uma mensagem.

Verificação: `node scripts/test-compras.mjs`. Exige `DATABASE_URL` local e cadastros ativos
de fornecedor, dois produtos e condição com parcelas. Os registros do teste são desfeitos com rollback;
as sequências de identificação podem avançar.
