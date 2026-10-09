-- Aplicar em bancos existentes. Preserva totais, rateios e contas já registrados.
begin;

alter table public.compras drop column if exists valor_desconto;

commit;
