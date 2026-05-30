"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/db";

const UNIDADES_MEDIDA_PATH = "/cadastro/produtos-servicos/unidades-medida";
const PRODUTOS_PATH = "/cadastro/produtos-servicos/produtos";

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

export async function createUnidadeMedidaAction(formData: FormData) {
	return saveUnidadeMedida(formData);
}

export async function updateUnidadeMedidaAction(formData: FormData) {
	const codunidadeMedida = Number(getText(formData, "codunidade_medida"));

	if (Number.isNaN(codunidadeMedida)) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Unidade de medida invalida para edicao."));
	}

	return saveUnidadeMedida(formData, codunidadeMedida);
}

export async function deleteUnidadeMedidaAction(formData: FormData) {
	const codunidadeMedida = Number(getText(formData, "codunidade_medida"));

	if (Number.isNaN(codunidadeMedida)) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Unidade de medida invalida para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.unidades_medida where codunidade_medida = $1",
		[codunidadeMedida]
	);

	if (error) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", error.message));
	}

	revalidatePath(UNIDADES_MEDIDA_PATH);
	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "success", "Unidade de medida excluida com sucesso."));
}

async function saveUnidadeMedida(formData: FormData, codunidadeMedida?: number) {
	const unidadeMedida = getText(formData, "unidade_medida");
	const sigla = getText(formData, "sigla").toUpperCase();
	const descricao = getText(formData, "descricao");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(unidadeMedida, 2, 80)) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Unidade de medida deve ter entre 2 e 80 caracteres."));
	}

	if (!isLengthBetween(sigla, 1, 10)) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Sigla deve ter entre 1 e 10 caracteres."));
	}

	if (descricao.length > 255) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", "Informe um status valido para a unidade de medida."));
	}

	const { error } = codunidadeMedida
		? await executeQuery(
				`update public.unidades_medida
				set unidade_medida = $1, sigla = $2, descricao = $3, ativo = $4
				where codunidade_medida = $5`,
				[unidadeMedida, sigla, descricao || null, ativo, codunidadeMedida]
			)
		: await executeQuery(
				"insert into public.unidades_medida (unidade_medida, sigla, descricao, ativo) values ($1, $2, $3, $4)",
				[unidadeMedida, sigla, descricao || null, ativo]
			);

	if (error) {
		redirect(buildRedirect(UNIDADES_MEDIDA_PATH, "error", error.message));
	}

	revalidatePath(UNIDADES_MEDIDA_PATH);
	revalidatePath(PRODUTOS_PATH);
	redirect(
		buildRedirect(
			UNIDADES_MEDIDA_PATH,
			"success",
			codunidadeMedida ? "Unidade de medida atualizada com sucesso." : "Unidade de medida salva com sucesso."
		)
	);
}
