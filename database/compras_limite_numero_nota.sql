-- Aplicar em bancos existentes depois de compras.sql e compras_financeiro.sql.
-- Reaplicavel e sem truncamento dos numeros existentes.
begin;

lock table public.compras, public.compras_itens, public.compras_parcelas in access exclusive mode;

do $$
begin
	if exists (
		select 1 from public.compras where char_length(numero_nota) > 9
		union all
		select 1 from public.compras_itens where char_length(numero_nota) > 9
		union all
		select 1 from public.compras_parcelas where char_length(numero_nota) > 9
	) then
		raise exception 'Existem numeros de nota maiores que 9 caracteres. Corrija os registros antes de aplicar o limite.';
	end if;
end;
$$;

alter table public.compras
	alter column numero_nota type varchar(9),
	drop constraint if exists compras_numero_nota_check,
	add constraint compras_numero_nota_check check (char_length(btrim(numero_nota)) between 1 and 9);

alter table public.compras_itens alter column numero_nota type varchar(9);
alter table public.compras_parcelas alter column numero_nota type varchar(9);

commit;
