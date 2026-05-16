import { queryMaybeSingle, queryRows } from "@/lib/db";

export async function listarPaises() {
	return queryRows("select codpais, pais, sigla, ddi, moeda, ativo from public.paises order by pais asc");
}

export async function buscarPaisPorId(codpais: number) {
	return queryMaybeSingle(
		"select codpais, pais, sigla, ddi, moeda, ativo from public.paises where codpais = $1",
		[codpais]
	);
}

export async function listarPaisesParaSelecao() {
	return queryRows("select codpais, pais from public.paises order by pais asc");
}

export async function listarEstadosParaSelecao() {
	return queryRows("select codestado, estado, uf from public.estados order by estado asc");
}

export async function listarEstadosComPaises() {
	const [{ data: paises }, { data: estados, error }] = await Promise.all([
		queryRows("select codpais, pais from public.paises order by pais asc"),
		queryRows("select codestado, estado, uf, codpais, ativo from public.estados order by estado asc"),
	]);

	return { paises, estados, error };
}

export async function buscarEstadoPorId(codestado: number) {
	return queryMaybeSingle(
		"select codestado, estado, uf, codpais, ativo from public.estados where codestado = $1",
		[codestado]
	);
}

export async function listarCidadesComEstados() {
	const [{ data: estados }, { data: cidades, error }] = await Promise.all([
		queryRows("select codestado, estado, uf from public.estados order by estado asc"),
		queryRows("select codcidade, cidade, codest, ativo from public.cidades order by cidade asc"),
	]);

	return { estados, cidades, error };
}

export async function buscarCidadePorId(codcidade: number) {
	return queryMaybeSingle(
		"select codcidade, cidade, codest, ativo from public.cidades where codcidade = $1",
		[codcidade]
	);
}
