import { queryMaybeSingle, queryRows } from "@/lib/database/db";

type CategoriaTipo = "PRODUTO" | "SERVICO" | "AMBOS";

export async function listarCategorias() {
	return queryRows("select codcategoria, categoria, descricao, tipo, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.categorias order by categoria asc");
}

export async function buscarCategoriaPorId(codcategoria: number) {
	return queryMaybeSingle(
		"select codcategoria, categoria, descricao, tipo, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.categorias where codcategoria = $1",
		[codcategoria]
	);
}

export async function listarCategoriasPorTipo(tipos: CategoriaTipo[]) {
	return queryRows(
		"select codcategoria, categoria from public.categorias where tipo = any($1::varchar[]) and ativo = 'S' order by categoria asc",
		[tipos]
	);
}

export async function listarProdutosComCategorias() {
	const [
		{ data: categorias },
		{ data: marcas },
		{ data: unidadesMedida },
		{ data: produtos, error },
	] = await Promise.all([
		queryRows("select codcategoria, categoria from public.categorias order by categoria asc"),
		queryRows("select codmarca, marca from public.marcas order by marca asc"),
		queryRows("select codunidade_medida, unidade_medida, sigla from public.unidades_medida order by unidade_medida asc"),
		queryRows(
			"select codproduto, produto, codcategoria, codmarca, codunidade_medida, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.produtos order by produto asc"
		),
	]);

	return { categorias, marcas, unidadesMedida, produtos, error };
}

export async function buscarProdutoPorId(codproduto: number) {
	return queryMaybeSingle(
		"select codproduto, produto, codcategoria, codmarca, codunidade_medida, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.produtos where codproduto = $1",
		[codproduto]
	);
}

export async function listarServicosComCategorias() {
	const [{ data: categorias }, { data: servicos, error }] = await Promise.all([
		queryRows("select codcategoria, categoria from public.categorias order by categoria asc"),
		queryRows(
			"select codservico, servico, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.servicos order by servico asc"
		),
	]);

	return { categorias, servicos, error };
}

export async function buscarServicoPorId(codservico: number) {
	return queryMaybeSingle(
		"select codservico, servico, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.servicos where codservico = $1",
		[codservico]
	);
}
