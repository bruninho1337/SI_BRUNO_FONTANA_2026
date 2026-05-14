import { createClient } from "@/lib/supabase/server";

type CategoriaTipo = "PRODUTO" | "SERVICO" | "AMBOS";

export async function listarCategorias() {
	const supabase = await createClient();

	return supabase
		.from("categorias")
		.select("codcategoria, nome, descricao, tipo, ativo")
		.order("nome", { ascending: true });
}

export async function buscarCategoriaPorId(codcategoria: number) {
	const supabase = await createClient();

	return supabase
		.from("categorias")
		.select("codcategoria, nome, descricao, tipo, ativo")
		.eq("codcategoria", codcategoria)
		.maybeSingle();
}

export async function listarCategoriasPorTipo(tipos: CategoriaTipo[]) {
	const supabase = await createClient();

	return supabase
		.from("categorias")
		.select("codcategoria, nome")
		.in("tipo", tipos)
		.eq("ativo", "S")
		.order("nome", { ascending: true });
}

export async function listarProdutosComCategorias() {
	const supabase = await createClient();

	const [{ data: categorias }, { data: produtos, error }] = await Promise.all([
		supabase.from("categorias").select("codcategoria, nome"),
		supabase
			.from("produtos")
			.select("codproduto, nome, codcategoria, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo")
			.order("nome", { ascending: true }),
	]);

	return { categorias, produtos, error };
}

export async function buscarProdutoPorId(codproduto: number) {
	const supabase = await createClient();

	return supabase
		.from("produtos")
		.select("codproduto, nome, codcategoria, valor, quantidade_estoque, valor_desconto, descricao, imagem_url, ativo")
		.eq("codproduto", codproduto)
		.maybeSingle();
}

export async function listarServicosComCategorias() {
	const supabase = await createClient();

	const [{ data: categorias }, { data: servicos, error }] = await Promise.all([
		supabase.from("categorias").select("codcategoria, nome"),
		supabase
			.from("servicos")
			.select("codservico, nome, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo")
			.order("nome", { ascending: true }),
	]);

	return { categorias, servicos, error };
}

export async function buscarServicoPorId(codservico: number) {
	const supabase = await createClient();

	return supabase
		.from("servicos")
		.select("codservico, nome, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo")
		.eq("codservico", codservico)
		.maybeSingle();
}
