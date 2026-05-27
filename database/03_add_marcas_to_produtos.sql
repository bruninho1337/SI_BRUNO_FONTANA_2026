alter table public.produtos
	add column if not exists codmarca integer;

alter table public.produtos
	drop constraint if exists produtos_codmarca_fkey;

alter table public.produtos
	add constraint produtos_codmarca_fkey foreign key (codmarca) references public.marcas(codmarca);
