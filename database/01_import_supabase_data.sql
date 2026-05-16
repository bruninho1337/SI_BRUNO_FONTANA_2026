insert into public.paises (
	codpais, pais, sigla, ddi, moeda, ativo, data_cadastro, data_ult_alteracao, usuario_ult_alteracao
) values (
	1, 'Brasil', 'BR', '55', 'BRL', 'S', '2026-04-11T18:07:45.38925'::timestamp, '2026-04-11T18:07:45.38925'::timestamp, null
) on conflict (codpais) do update set
	pais = excluded.pais,
	sigla = excluded.sigla,
	ddi = excluded.ddi,
	moeda = excluded.moeda,
	ativo = excluded.ativo;

insert into public.estados (
	codestado, uf, estado, codpais, ativo, data_cadastro, data_ult_alteracao, usuario_ult_alteracao
) values (
	1, 'PR', U&'Paran\00E1', 1, 'S', '2026-05-05T23:58:19.427822'::timestamp, '2026-05-05T23:58:19.427822'::timestamp, null
) on conflict (codestado) do update set
	uf = excluded.uf,
	estado = excluded.estado,
	codpais = excluded.codpais,
	ativo = excluded.ativo;

insert into public.cidades (
	codcidade, cidade, codest, ativo, data_cadastro, data_ult_alteracao, usuario_ult_alteracao
) values (
	1, U&'Foz do Igua\00E7u', 1, 'S', '2026-05-05T23:58:35.455474'::timestamp, '2026-05-05T23:58:35.455474'::timestamp, null
) on conflict (codcidade) do update set
	cidade = excluded.cidade,
	codest = excluded.codest,
	ativo = excluded.ativo;

insert into public.categorias (
	codcategoria, nome, descricao, tipo, ativo, data_cadastro, data_ult_alteracao, usuario_ult_alteracao
) values (
	1,
	U&'Finaliza\00E7\00E3o',
	U&'Produtos e servi\00E7os utilizados para modelar, fixar e dar acabamento ao cabelo ap\00F3s o corte, garantindo estilo e durabilidade do penteado.',
	'PRODUTO',
	'S',
	'2026-04-11T19:05:39.203332'::timestamp,
	'2026-04-11T19:05:39.203332'::timestamp,
	null
) on conflict (codcategoria) do update set
	nome = excluded.nome,
	descricao = excluded.descricao,
	tipo = excluded.tipo,
	ativo = excluded.ativo;

insert into public.produtos (
	codproduto, nome, codcategoria, valor, quantidade_estoque, valor_desconto, descricao,
	imagem_url, ativo, data_cadastro, data_ult_alteracao, usuario_ult_alteracao
) values (
	2,
	'Pomada Modeladora',
	1,
	39.9,
	40,
	12,
	'test de desc',
	'https://lbiuoahiddvhryxtqdgy.supabase.co/storage/v1/object/public/upload/produtos/1776984543035-foto-teia-11.png',
	'S',
	'2026-04-23T22:49:02.459015'::timestamp,
	'2026-04-23T22:49:02.459015'::timestamp,
	null
) on conflict (codproduto) do update set
	nome = excluded.nome,
	codcategoria = excluded.codcategoria,
	valor = excluded.valor,
	quantidade_estoque = excluded.quantidade_estoque,
	valor_desconto = excluded.valor_desconto,
	descricao = excluded.descricao,
	imagem_url = excluded.imagem_url,
	ativo = excluded.ativo;

insert into public.clientes (
	codcliente, tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro,
	cep, codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade,
	data_nascimento, rg_inscricao_estadual, cpf_cnpj, observacoes, data_criacao,
	data_atualizacao, ativo
) values (
	4,
	'FISICA',
	'Bruno Fontana',
	'Bruno',
	'SOLTEIRO',
	'Avenida Parati',
	'1521',
	'Cond. Moradas da Vila',
	'Vila A',
	'85860450',
	1,
	null,
	'45999057378',
	'brunofontana895@gmail.com',
	'MASCULINO',
	'Brasileiro',
	'2005-05-27'::date,
	'1234567894',
	'01374606944',
	'teste de observacion',
	'2026-05-14T23:11:42.457106+00:00'::timestamptz,
	'2026-05-16T00:57:16.927951+00:00'::timestamptz,
	'S'
) on conflict (codcliente) do update set
	tipo = excluded.tipo,
	cliente = excluded.cliente,
	apelido = excluded.apelido,
	estado_civil = excluded.estado_civil,
	endereco = excluded.endereco,
	numero = excluded.numero,
	complemento = excluded.complemento,
	bairro = excluded.bairro,
	cep = excluded.cep,
	codcidade = excluded.codcidade,
	codcondicao_pagamento = excluded.codcondicao_pagamento,
	telefone = excluded.telefone,
	email = excluded.email,
	sexo = excluded.sexo,
	nacionalidade = excluded.nacionalidade,
	data_nascimento = excluded.data_nascimento,
	rg_inscricao_estadual = excluded.rg_inscricao_estadual,
	cpf_cnpj = excluded.cpf_cnpj,
	observacoes = excluded.observacoes,
	ativo = excluded.ativo;

select setval(pg_get_serial_sequence('public.paises', 'codpais'), coalesce((select max(codpais) from public.paises), 1), true);
select setval(pg_get_serial_sequence('public.estados', 'codestado'), coalesce((select max(codestado) from public.estados), 1), true);
select setval(pg_get_serial_sequence('public.cidades', 'codcidade'), coalesce((select max(codcidade) from public.cidades), 1), true);
select setval(pg_get_serial_sequence('public.categorias', 'codcategoria'), coalesce((select max(codcategoria) from public.categorias), 1), true);
select setval(pg_get_serial_sequence('public.produtos', 'codproduto'), coalesce((select max(codproduto) from public.produtos), 1), true);
select setval(pg_get_serial_sequence('public.clientes', 'codcliente'), coalesce((select max(codcliente) from public.clientes), 1), true);
