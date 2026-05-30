"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/db";

const FUNCOES_FUNCIONARIOS_PATH = "/cadastro/funcoes-funcionarios";
const FUNCIONARIOS_PATH = "/cadastro/funcionarios";

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

export async function createFuncaoFuncionarioAction(formData: FormData) {
	return saveFuncaoFuncionario(formData);
}

export async function updateFuncaoFuncionarioAction(formData: FormData) {
	const codfuncaoFuncionario = Number(getText(formData, "codfuncao_funcionario"));

	if (Number.isNaN(codfuncaoFuncionario)) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", "Funcao invalida para edicao."));
	}

	return saveFuncaoFuncionario(formData, codfuncaoFuncionario);
}

export async function deleteFuncaoFuncionarioAction(formData: FormData) {
	const codfuncaoFuncionario = Number(getText(formData, "codfuncao_funcionario"));

	if (Number.isNaN(codfuncaoFuncionario)) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", "Funcao invalida para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.funcoes_funcionarios where codfuncao_funcionario = $1",
		[codfuncaoFuncionario]
	);

	if (error) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", error.message));
	}

	revalidatePath(FUNCOES_FUNCIONARIOS_PATH);
	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "success", "Funcao excluida com sucesso."));
}

async function saveFuncaoFuncionario(formData: FormData, codfuncaoFuncionario?: number) {
	const funcaoFuncionario = getText(formData, "funcao_funcionario");
	const descricao = getText(formData, "descricao");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(funcaoFuncionario, 2, 60)) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", "Funcao deve ter entre 2 e 60 caracteres."));
	}

	if (descricao.length > 255) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", "Informe um status valido para a funcao."));
	}

	const { error } = codfuncaoFuncionario
		? await executeQuery(
				`update public.funcoes_funcionarios
				set funcao_funcionario = $1, descricao = $2, ativo = $3
				where codfuncao_funcionario = $4`,
				[funcaoFuncionario, descricao || null, ativo, codfuncaoFuncionario]
			)
		: await executeQuery(
				`insert into public.funcoes_funcionarios (funcao_funcionario, descricao, ativo)
				values ($1, $2, $3)`,
				[funcaoFuncionario, descricao || null, ativo]
			);

	if (error) {
		redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "error", error.message));
	}

	revalidatePath(FUNCOES_FUNCIONARIOS_PATH);
	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCOES_FUNCIONARIOS_PATH, "success", codfuncaoFuncionario ? "Funcao atualizada com sucesso." : "Funcao salva com sucesso."));
}
