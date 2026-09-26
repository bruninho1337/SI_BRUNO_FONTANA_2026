-- Aplicar em bancos existentes depois de compras.sql e compras_financeiro.sql.
-- Reaplicavel: interrompe sem truncar dados que ultrapassem os limites.
begin;

lock table public.compras, public.compras_itens, public.compras_parcelas in access exclusive mode;

do $$
begin
	if exists (
		select 1 from public.compras where char_length(modelo) > 2 or char_length(serie) > 3
		union all
		select 1 from public.compras_itens where char_length(modelo) > 2 or char_length(serie) > 3
		union all
		select 1 from public.compras_parcelas where char_length(modelo) > 2 or char_length(serie) > 3
	) then
		raise exception 'Existem compras com modelo maior que 2 ou serie maior que 3 caracteres. Corrija os registros antes de aplicar os limites.';
	end if;
end;
$$;

alter table public.compras
	alter column modelo type varchar(2),
	alter column serie type varchar(3),
	drop constraint if exists compras_modelo_check,
	drop constraint if exists compras_serie_check,
	add constraint compras_modelo_check check (char_length(btrim(modelo)) between 1 and 2),
	add constraint compras_serie_check check (char_length(btrim(serie)) between 1 and 3);

alter table public.compras_itens
	alter column modelo type varchar(2),
	alter column serie type varchar(3);

alter table public.compras_parcelas
	alter column modelo type varchar(2),
	alter column serie type varchar(3);

commit;
