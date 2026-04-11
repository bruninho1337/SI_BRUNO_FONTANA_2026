"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	return `${path}?${params.toString()}`;
}

export async function createPaisAction(formData: FormData) {
	const pais = String(formData.get("pais") ?? "").trim();
	const sigla = String(formData.get("sigla") ?? "").trim().toUpperCase();
	const ddi = String(formData.get("ddi") ?? "").trim();
	const moeda = String(formData.get("moeda") ?? "").trim().toUpperCase();
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!pais) {
		redirect(buildRedirect("/cadastro/localidades/paises", "error", "Informe o nome do país."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("paises").insert({
		pais,
		sigla: sigla || null,
		ddi: ddi || null,
		moeda: moeda || null,
		ativo,
	});

	if (error) {
		redirect(buildRedirect("/cadastro/localidades/paises", "error", error.message));
	}

	revalidatePath("/cadastro/localidades/paises");
	revalidatePath("/cadastro/localidades/estados");
	redirect(buildRedirect("/cadastro/localidades/paises", "success", "País salvo com sucesso."));
}

export async function createEstadoAction(formData: FormData) {
	const uf = String(formData.get("uf") ?? "").trim().toUpperCase();
	const estado = String(formData.get("estado") ?? "").trim();
	const codpaisValue = String(formData.get("codpais") ?? "").trim();
	const codpais = Number(codpaisValue);
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!uf || !estado || !codpaisValue || Number.isNaN(codpais)) {
		redirect(buildRedirect("/cadastro/localidades/estados", "error", "Preencha UF, estado e país."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("estados").insert({
		uf,
		estado,
		codpais,
		ativo,
	});

	if (error) {
		redirect(buildRedirect("/cadastro/localidades/estados", "error", error.message));
	}

	revalidatePath("/cadastro/localidades/estados");
	revalidatePath("/cadastro/localidades/cidades");
	redirect(buildRedirect("/cadastro/localidades/estados", "success", "Estado salvo com sucesso."));
}

export async function createCidadeAction(formData: FormData) {
	const cidade = String(formData.get("cidade") ?? "").trim();
	const codestValue = String(formData.get("codest") ?? "").trim();
	const codest = Number(codestValue);
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!cidade || !codestValue || Number.isNaN(codest)) {
		redirect(buildRedirect("/cadastro/localidades/cidades", "error", "Preencha a cidade e selecione um estado."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("cidades").insert({
		cidade,
		codest,
		ativo,
	});

	if (error) {
		redirect(buildRedirect("/cadastro/localidades/cidades", "error", error.message));
	}

	revalidatePath("/cadastro/localidades/cidades");
	redirect(buildRedirect("/cadastro/localidades/cidades", "success", "Cidade salva com sucesso."));
}
