-- Preserva custos unitários com frações de centavo; totais continuam em centavos.
begin;

alter table public.compras_itens alter column valor_unitario type numeric;

commit;
