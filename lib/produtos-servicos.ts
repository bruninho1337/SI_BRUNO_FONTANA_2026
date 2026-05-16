import { queryMaybeSingle, queryRows } from "@/lib/db";

type CategoriaTipo = "PRODUTO" | "SERVICO" | "AMBOS";

export async function listarCategorias() {
	return queryRows("select codcategoria, nome, descricao, tipo, ativo from public.categorias order by nome asc");
}

export async function buscarCategoriaPorId(codcategoria: number) {
	return queryMaybeSingle(
		"select codcategoria, nome, descricao, tipo, ativo from public.categorias where codcategoria = $1",
		[codcategoria]
	);
}

export async function listarCategoriasPorTipo(tipos: CategoriaTipo[]) {
	return queryRows(
		"select codcategoria, nome from public.categorias where tipo = any($1::varchar[]) and ativo = 'S' order by nome asc",
		[tipos]
	);
}

export async function listarProdutosComCategorias() {
	const [{ data: categorias }, { data: produtos, error }] = await Promise.all([
		queryRows("select codcategoria, nome from public.categorias order by nome asc"),
		queryRows(
			"select codproduto, nome, codcategoria, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo from public.produtos order by nome asc"
		),
	]);

	return { categorias, produtos, error };
}

export async function buscarProdutoPorId(codproduto: number) {
	return queryMaybeSingle(
		"select codproduto, nome, codcategoria, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo from public.produtos where codproduto = $1",
		[codproduto]
	);
}

export async function listarServicosComCategorias() {
	const [{ data: categorias }, { data: servicos, error }] = await Promise.all([
		queryRows("select codcategoria, nome from public.categorias order by nome asc"),
		queryRows(
			"select codservico, nome, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo from public.servicos order by nome asc"
		),
	]);

	return { categorias, servicos, error };
}

export async function buscarServicoPorId(codservico: number) {
	return queryMaybeSingle(
		"select codservico, nome, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo from public.servicos where codservico = $1",
		[codservico]
	);
}
