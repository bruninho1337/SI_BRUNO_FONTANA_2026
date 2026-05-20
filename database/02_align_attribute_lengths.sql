alter table public.produtos
	alter column nome type varchar(80);

alter table public.servicos
	alter column nome type varchar(80);

alter table public.clientes
	drop constraint if exists clientes_codcidade_fkey;

alter table public.clientes
	alter column codcidade type integer using codcidade::integer;

alter table public.clientes
	add constraint clientes_codcidade_fkey foreign key (codcidade) references public.cidades(codcidade);

alter table public.clientes
	drop constraint if exists chk_clientes_cep_tamanho,
	drop constraint if exists chk_clientes_telefone_tamanho,
	drop constraint if exists chk_clientes_cpf_cnpj_tamanho,
	add constraint chk_clientes_cep_tamanho check (char_length(cep) = 8),
	add constraint chk_clientes_telefone_tamanho check (char_length(telefone) in (10, 11)),
	add constraint chk_clientes_cpf_cnpj_tamanho check (cpf_cnpj is null or char_length(cpf_cnpj) in (11, 14));

alter table public.fornecedores
	drop constraint if exists chk_fornecedores_cep_tamanho,
	drop constraint if exists chk_fornecedores_telefone_tamanho,
	drop constraint if exists chk_fornecedores_cpf_cnpj_tamanho,
	add constraint chk_fornecedores_cep_tamanho check (char_length(cep) = 8),
	add constraint chk_fornecedores_telefone_tamanho check (char_length(telefone) in (10, 11)),
	add constraint chk_fornecedores_cpf_cnpj_tamanho check (cpf_cnpj is null or char_length(cpf_cnpj) in (11, 14));

alter table public.categorias
	drop constraint if exists chk_categorias_descricao_tamanho,
	add constraint chk_categorias_descricao_tamanho check (descricao is null or char_length(descricao) <= 255);

alter table public.produtos
	drop constraint if exists chk_produtos_nome_tamanho,
	drop constraint if exists chk_produtos_descricao_tamanho,
	add constraint chk_produtos_nome_tamanho check (char_length(nome) between 2 and 80),
	add constraint chk_produtos_descricao_tamanho check (descricao is null or char_length(descricao) <= 255);

alter table public.servicos
	drop constraint if exists chk_servicos_nome_tamanho,
	drop constraint if exists chk_servicos_descricao_tamanho,
	add constraint chk_servicos_nome_tamanho check (char_length(nome) between 2 and 80),
	add constraint chk_servicos_descricao_tamanho check (descricao is null or char_length(descricao) <= 255);
