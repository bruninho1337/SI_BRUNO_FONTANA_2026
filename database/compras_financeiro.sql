-- Executar após compras.sql e contas_pagar.sql. Migração aditiva e reaplicável.
begin;

alter table public.compras add column if not exists motivo_cancelamento text
	check (motivo_cancelamento is null or char_length(btrim(motivo_cancelamento)) between 1 and 500);
alter table public.compras add column if not exists data_cancelamento timestamp;
alter table public.compras_itens add column if not exists valor_rateio numeric(14,2);

create table if not exists public.compras_parcelas (
	modelo varchar(10) not null,
	serie varchar(10) not null,
	numero_nota varchar(30) not null,
	codfornecedor bigint not null,
	num_parcela integer not null check (num_parcela > 0),
	percentual numeric(7,4) not null check (percentual > 0 and percentual <= 100),
	codconta_pagar bigint not null unique references public.contas_pagar(codconta_pagar) on delete restrict,
	primary key (modelo, serie, numero_nota, codfornecedor, num_parcela),
	foreign key (modelo, serie, numero_nota, codfornecedor)
		references public.compras(modelo, serie, numero_nota, codfornecedor) on delete restrict
);

commit;
