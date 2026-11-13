-- Quantidades fracionadas nas compras e no estoque. Reaplicável após compras.sql.
-- O desconto total mantém quatro casas: quantidade (2) x desconto unitário (2).
-- Valores existentes são preservados; os totais financeiros continuam em centavos.
begin;

alter table public.compras_itens alter column quantidade type numeric(12,2);
alter table public.compras_itens alter column valor_desconto type numeric(16,4);
alter table public.produtos alter column quantidade_estoque type numeric(14,2);

commit;
