"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

	const supabase = await createClient();
	const { error } = await supabase.from("paises").delete().eq("codpais", codpais);

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

	if (!pais) {
		redirect(buildRedirect(PAISES_PATH, "error", "Informe o nome do pais."));
	}

	const supabase = await createClient();
	const payload = {
		pais,
		sigla: sigla || null,
		ddi: ddi || null,
		moeda: moeda || null,
		ativo,
	};
	const { error } = codpais
		? await supabase.from("paises").update(payload).eq("codpais", codpais)
		: await supabase.from("paises").insert(payload);

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

	const supabase = await createClient();
	const { error } = await supabase.from("estados").delete().eq("codestado", codestado);

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

	if (!uf || !estado || !codpaisValue || Number.isNaN(codpais)) {
		redirect(buildRedirect(ESTADOS_PATH, "error", "Preencha UF, estado e pais."));
	}

	const supabase = await createClient();
	const payload = {
		uf,
		estado,
		codpais,
		ativo,
	};
	const { error } = codestado
		? await supabase.from("estados").update(payload).eq("codestado", codestado)
		: await supabase.from("estados").insert(payload);

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

	const supabase = await createClient();
	const { error } = await supabase.from("cidades").delete().eq("codcidade", codcidade);

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

	if (!cidade || !codestValue || Number.isNaN(codest)) {
		redirect(buildRedirect(CIDADES_PATH, "error", "Preencha a cidade e selecione um estado."));
	}

	const supabase = await createClient();
	const payload = {
		cidade,
		codest,
		ativo,
	};
	const { error } = codcidade
		? await supabase.from("cidades").update(payload).eq("codcidade", codcidade)
		: await supabase.from("cidades").insert(payload);

	if (error) {
		redirect(buildRedirect(CIDADES_PATH, "error", error.message));
	}

	revalidatePath(CIDADES_PATH);
	redirect(buildRedirect(CIDADES_PATH, "success", codcidade ? "Cidade atualizada com sucesso." : "Cidade salva com sucesso."));
}
