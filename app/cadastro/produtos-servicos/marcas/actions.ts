"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/database/db";

const MARCAS_PATH = "/cadastro/produtos-servicos/marcas";
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

export async function createMarcaAction(formData: FormData) {
	return saveMarca(formData);
}

export async function updateMarcaAction(formData: FormData) {
	const codmarca = Number(getText(formData, "codmarca"));

	if (Number.isNaN(codmarca)) {
		redirect(buildRedirect(MARCAS_PATH, "error", "Marca invalida para edicao."));
	}

	return saveMarca(formData, codmarca);
}

export async function deleteMarcaAction(formData: FormData) {
	const codmarca = Number(getText(formData, "codmarca"));

	if (Number.isNaN(codmarca)) {
		redirect(buildRedirect(MARCAS_PATH, "error", "Marca invalida para exclusao."));
	}

	const { error } = await executeQuery("delete from public.marcas where codmarca = $1", [codmarca]);

	if (error) {
		redirect(buildRedirect(MARCAS_PATH, "error", error.message));
	}

	revalidatePath(MARCAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(MARCAS_PATH, "success", "Marca excluida com sucesso."));
}

async function saveMarca(formData: FormData, codmarca?: number) {
	const marca = getText(formData, "marca");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(marca, 2, 80)) {
		redirect(buildRedirect(MARCAS_PATH, "error", "Marca deve ter entre 2 e 80 caracteres."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(MARCAS_PATH, "error", "Informe um status valido para a marca."));
	}

	const { error } = codmarca
		? await executeQuery(
				"update public.marcas set marca = $1, ativo = $2 where codmarca = $3",
				[marca, ativo, codmarca]
			)
		: await executeQuery(
				"insert into public.marcas (marca, ativo) values ($1, $2)",
				[marca, ativo]
			);

	if (error) {
		redirect(buildRedirect(MARCAS_PATH, "error", error.message));
	}

	revalidatePath(MARCAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(MARCAS_PATH, "success", codmarca ? "Marca atualizada com sucesso." : "Marca salva com sucesso."));
}
