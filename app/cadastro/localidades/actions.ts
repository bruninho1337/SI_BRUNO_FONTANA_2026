"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/db";

const PAISES_PATH = "/cadastro/localidades/paises";
const ESTADOS_PATH = "/cadastro/localidades/estados";
const CIDADES_PATH = "/cadastro/localidades/cidades";

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	return `${path}?${params.toString()}`;
}

function getText(formData: FormData, name: string) {
	return String(formData.get(name) ?? "").trim();
}

function isLengthBetween(value: string, min: number, max: number) {
	return value.length >= min && value.length <= max;
}

export async function createPaisAction(formData: FormData) {
	return savePais(formData);
}

export async function updatePaisAction(formData: FormData) {
	const codpais = Number(getText(formData, "codpais"));

	if (Number.isNaN(codpais)) {
		redirect(buildRedirect(PAISES_PATH, "error", "Pais invalido para edicao."));
	}

	return savePais(formData, codpais);
}

export async function deletePaisAction(formData: FormData) {
	const codpais = Number(getText(formData, "codpais"));

	if (Number.isNaN(codpais)) {
		redirect(buildRedirect(PAISES_PATH, "error", "Pais invalido para exclusao."));
	}

	const { error } = await executeQuery("delete from public.paises where codpais = $1", [codpais]);

	if (error) {
		redirect(buildRedirect(PAISES_PATH, "error", error.message));
	}

	revalidatePath(PAISES_PATH);
	revalidatePath(ESTADOS_PATH);
	redirect(buildRedirect(PAISES_PATH, "success", "Pais excluido com sucesso."));
}

async function savePais(formData: FormData, codpais?: number) {
	const pais = getText(formData, "pais");
	const sigla = getText(formData, "sigla").toUpperCase();
	const ddi = getText(formData, "ddi");
	const moeda = getText(formData, "moeda").toUpperCase();
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(pais, 2, 60)) {
		redirect(buildRedirect(PAISES_PATH, "error", "Pais deve ter entre 2 e 60 caracteres."));
	}

	if (!isLengthBetween(sigla, 1, 5)) {
		redirect(buildRedirect(PAISES_PATH, "error", "Sigla deve ter entre 1 e 5 caracteres."));
	}

	if (!isLengthBetween(ddi, 1, 5)) {
		redirect(buildRedirect(PAISES_PATH, "error", "DDI deve ter entre 1 e 5 caracteres."));
	}

	if (!isLengthBetween(moeda, 1, 10)) {
		redirect(buildRedirect(PAISES_PATH, "error", "Moeda deve ter entre 1 e 10 caracteres."));
	}

	const { error } = codpais
		? await executeQuery(
				"update public.paises set pais = $1, sigla = $2, ddi = $3, moeda = $4, ativo = $5 where codpais = $6",
				[pais, sigla, ddi, moeda, ativo, codpais]
			)
		: await executeQuery(
				"insert into public.paises (pais, sigla, ddi, moeda, ativo) values ($1, $2, $3, $4, $5)",
				[pais, sigla, ddi, moeda, ativo]
			);

	if (error) {
		redirect(buildRedirect(PAISES_PATH, "error", error.message));
	}

	revalidatePath(PAISES_PATH);
	revalidatePath(ESTADOS_PATH);
	redirect(buildRedirect(PAISES_PATH, "success", codpais ? "Pais atualizado com sucesso." : "Pais salvo com sucesso."));
}

export async function createEstadoAction(formData: FormData) {
	return saveEstado(formData);
}

export async function updateEstadoAction(formData: FormData) {
	const codestado = Number(getText(formData, "codestado"));

	if (Number.isNaN(codestado)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "Estado invalido para edicao."));
	}

	return saveEstado(formData, codestado);
}

export async function deleteEstadoAction(formData: FormData) {
	const codestado = Number(getText(formData, "codestado"));

	if (Number.isNaN(codestado)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "Estado invalido para exclusao."));
	}

	const { error } = await executeQuery("delete from public.estados where codestado = $1", [codestado]);

	if (error) {
		redirect(buildRedirect(ESTADOS_PATH, "error", error.message));
	}

	revalidatePath(ESTADOS_PATH);
	revalidatePath(CIDADES_PATH);
	redirect(buildRedirect(ESTADOS_PATH, "success", "Estado excluido com sucesso."));
}

async function saveEstado(formData: FormData, codestado?: number) {
	const uf = getText(formData, "uf").toUpperCase();
	const estado = getText(formData, "estado");
	const codpaisValue = getText(formData, "codpais");
	const codpais = Number(codpaisValue);
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(uf, 2, 2)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "UF deve ter exatamente 2 caracteres."));
	}

	if (!isLengthBetween(estado, 2, 60)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "Estado deve ter entre 2 e 60 caracteres."));
	}

	if (!codpaisValue || Number.isNaN(codpais)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "Selecione o pais do estado."));
	}

	const { error } = codestado
		? await executeQuery(
				"update public.estados set uf = $1, estado = $2, codpais = $3, ativo = $4 where codestado = $5",
				[uf, estado, codpais, ativo, codestado]
			)
		: await executeQuery(
				"insert into public.estados (uf, estado, codpais, ativo) values ($1, $2, $3, $4)",
				[uf, estado, codpais, ativo]
			);

	if (error) {
		redirect(buildRedirect(ESTADOS_PATH, "error", error.message));
	}

	revalidatePath(ESTADOS_PATH);
	revalidatePath(CIDADES_PATH);
	redirect(buildRedirect(ESTADOS_PATH, "success", codestado ? "Estado atualizado com sucesso." : "Estado salvo com sucesso."));
}

export async function createCidadeAction(formData: FormData) {
	return saveCidade(formData);
}

export async function updateCidadeAction(formData: FormData) {
	const codcidade = Number(getText(formData, "codcidade"));

	if (Number.isNaN(codcidade)) {
		redirect(buildRedirect(CIDADES_PATH, "error", "Cidade invalida para edicao."));
	}

	return saveCidade(formData, codcidade);
}

export async function deleteCidadeAction(formData: FormData) {
	const codcidade = Number(getText(formData, "codcidade"));

	if (Number.isNaN(codcidade)) {
		redirect(buildRedirect(CIDADES_PATH, "error", "Cidade invalida para exclusao."));
	}

	const { error } = await executeQuery("delete from public.cidades where codcidade = $1", [codcidade]);

	if (error) {
		redirect(buildRedirect(CIDADES_PATH, "error", error.message));
	}

	revalidatePath(CIDADES_PATH);
	redirect(buildRedirect(CIDADES_PATH, "success", "Cidade excluida com sucesso."));
}

async function saveCidade(formData: FormData, codcidade?: number) {
	const cidade = getText(formData, "cidade");
	const codestValue = getText(formData, "codest");
	const codest = Number(codestValue);
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(cidade, 2, 100)) {
		redirect(buildRedirect(CIDADES_PATH, "error", "Cidade deve ter entre 2 e 100 caracteres."));
	}

	if (!codestValue || Number.isNaN(codest)) {
		redirect(buildRedirect(CIDADES_PATH, "error", "Selecione o estado da cidade."));
	}

	const { error } = codcidade
		? await executeQuery(
				"update public.cidades set cidade = $1, codest = $2, ativo = $3 where codcidade = $4",
				[cidade, codest, ativo, codcidade]
			)
		: await executeQuery(
				"insert into public.cidades (cidade, codest, ativo) values ($1, $2, $3)",
				[cidade, codest, ativo]
			);

	if (error) {
		redirect(buildRedirect(CIDADES_PATH, "error", error.message));
	}

	revalidatePath(CIDADES_PATH);
	redirect(buildRedirect(CIDADES_PATH, "success", codcidade ? "Cidade atualizada com sucesso." : "Cidade salva com sucesso."));
}
