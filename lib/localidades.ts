import { createClient } from "@/lib/supabase/server";

export async function listarPaises() {
	const supabase = await createClient();

	return supabase
		.from("paises")
		.select("codpais, pais, sigla, ddi, moeda, ativo")
		.order("pais", { ascending: true });
}

export async function buscarPaisPorId(codpais: number) {
	const supabase = await createClient();

	return supabase
		.from("paises")
		.select("codpais, pais, sigla, ddi, moeda, ativo")
		.eq("codpais", codpais)
		.maybeSingle();
}

export async function listarPaisesParaSelecao() {
	const supabase = await createClient();

	return supabase
		.from("paises")
		.select("codpais, pais")
		.order("pais", { ascending: true });
}

export async function listarEstadosParaSelecao() {
	const supabase = await createClient();

	return supabase
		.from("estados")
		.select("codestado, estado, uf")
		.order("estado", { ascending: true });
}

export async function listarEstadosComPaises() {
	const supabase = await createClient();

	const [{ data: paises }, { data: estados, error }] = await Promise.all([
		supabase.from("paises").select("codpais, pais"),
		supabase
			.from("estados")
			.select("codestado, estado, uf, codpais, ativo")
			.order("estado", { ascending: true }),
	]);

	return { paises, estados, error };
}

export async function buscarEstadoPorId(codestado: number) {
	const supabase = await createClient();

	return supabase
		.from("estados")
		.select("codestado, estado, uf, codpais, ativo")
		.eq("codestado", codestado)
		.maybeSingle();
}

export async function listarCidadesComEstados() {
	const supabase = await createClient();

	const [{ data: estados }, { data: cidades, error }] = await Promise.all([
		supabase.from("estados").select("codestado, estado, uf"),
		supabase
			.from("cidades")
			.select("codcidade, cidade, codest, ativo")
			.order("cidade", { ascending: true }),
	]);

	return { estados, cidades, error };
}

export async function buscarCidadePorId(codcidade: number) {
	const supabase = await createClient();

	return supabase
		.from("cidades")
		.select("codcidade, cidade, codest, ativo")
		.eq("codcidade", codcidade)
		.maybeSingle();
}
