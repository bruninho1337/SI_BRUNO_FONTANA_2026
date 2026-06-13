import { queryMaybeSingle, queryRows } from "@/lib/database/db";

export async function listarPaises() {
	return queryRows("select codpais, pais, sigla, ddi, moeda, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.paises order by pais asc");
}

export async function buscarPaisPorId(codpais: number) {
	return queryMaybeSingle(
		"select codpais, pais, sigla, ddi, moeda, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.paises where codpais = $1",
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
		queryRows("select codestado, estado, uf, codpais, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.estados order by estado asc"),
	]);

	return { paises, estados, error };
}

export async function buscarEstadoPorId(codestado: number) {
	return queryMaybeSingle(
		"select codestado, estado, uf, codpais, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.estados where codestado = $1",
		[codestado]
	);
}

export async function listarCidadesComEstados() {
	const [{ data: estados }, { data: cidades, error }] = await Promise.all([
		queryRows("select codestado, estado, uf from public.estados order by estado asc"),
		queryRows("select codcidade, cidade, codest, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.cidades order by cidade asc"),
	]);

	return { estados, cidades, error };
}

export async function buscarCidadePorId(codcidade: number) {
	return queryMaybeSingle(
		"select codcidade, cidade, codest, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.cidades where codcidade = $1",
		[codcidade]
	);
}
