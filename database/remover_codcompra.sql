begin;

set local statement_timeout = '30s';
lock table public.compras, public.compras_itens in access exclusive mode;

alter table public.compras_itens
	add column modelo varchar(10),
	add column serie varchar(10),
	add column numero_nota varchar(30),
	add column codfornecedor bigint;

update public.compras_itens ci
set modelo = c.modelo,
	serie = c.serie,
	numero_nota = c.numero_nota,
	codfornecedor = c.codfornecedor
from public.compras c
where c.codcompra = ci.codcompra;

alter table public.compras_itens
	alter column modelo set not null,
	alter column serie set not null,
	alter column numero_nota set not null,
	alter column codfornecedor set not null;

alter table public.compras_itens
	drop constraint compras_itens_compra_fkey,
	drop constraint compras_itens_pkey,
	drop constraint compras_itens_produto_unique;

alter table public.compras
	drop constraint compras_pkey,
	add constraint compras_pkey
		primary key (modelo, serie, numero_nota, codfornecedor);

alter table public.compras_itens
	add constraint compras_itens_pkey
		primary key (modelo, serie, numero_nota, codfornecedor, num_item),
	add constraint compras_itens_compra_fkey
		foreign key (modelo, serie, numero_nota, codfornecedor)
		references public.compras(modelo, serie, numero_nota, codfornecedor)
		on delete cascade,
	add constraint compras_itens_produto_unique
		unique (modelo, serie, numero_nota, codfornecedor, codproduto);

alter table public.compras_itens
	drop column codcompra;

alter table public.compras
	drop column codcompra;

commit;
