"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/db";

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

function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

function parseDecimal(value: FormDataEntryValue | null) {
	const normalized = String(value ?? "")
		.trim()
		.replace(/\./g, "")
		.replace(",", ".");

	if (!normalized) {
		return 0;
	}

	return Number(normalized);
}

function isLengthBetween(value: string, min: number, max: number) {
	return value.length >= min && value.length <= max;
}

function isValidDate(value: string) {
	if (!value) {
		return false;
	}

	const date = new Date(`${value}T00:00:00`);

	return !Number.isNaN(date.getTime());
}

export async function createFuncionarioAction(formData: FormData) {
	return saveFuncionario(formData);
}

export async function updateFuncionarioAction(formData: FormData) {
	const codfuncionario = Number(getText(formData, "codfuncionario"));

	if (Number.isNaN(codfuncionario)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Funcionário invalido para edicao."));
	}

	return saveFuncionario(formData, codfuncionario);
}

export async function deleteFuncionarioAction(formData: FormData) {
	const codfuncionario = Number(getText(formData, "codfuncionario"));

	if (Number.isNaN(codfuncionario)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Funcionário invalido para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.funcionarios where codfuncionario = $1",
		[codfuncionario]
	);

	if (error) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", error.message));
	}

	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCIONARIOS_PATH, "success", "Funcionário excluido com sucesso."));
}

async function saveFuncionario(formData: FormData, codfuncionario?: number) {
	const funcionario = getText(formData, "funcionario");
	const apelido = getText(formData, "apelido");
	const codfuncaoFuncionarioValue = getText(formData, "codfuncao_funcionario");
	const codfuncaoFuncionario = Number(codfuncaoFuncionarioValue);
	const telefone = onlyDigits(getText(formData, "telefone"));
	const email = getText(formData, "email");
	const cpf = onlyDigits(getText(formData, "cpf"));
	const rg = onlyDigits(getText(formData, "rg"));
	const dataNascimento = getText(formData, "data_nascimento");
	const dataAdmissao = getText(formData, "data_admissao");
	const dataDemissao = getText(formData, "data_demissao");
	const salarioBase = parseDecimal(formData.get("salario_base"));
	const percentualComissao = parseDecimal(formData.get("percentual_comissao"));
	const observacoes = getText(formData, "observacoes");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(funcionario, 5, 80)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Funcionário deve ter entre 5 e 80 caracteres."));
	}

	if (apelido.length > 60) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Apelido deve ter no maximo 60 caracteres."));
	}

	if (!codfuncaoFuncionarioValue || Number.isNaN(codfuncaoFuncionario)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Selecione a funcao do funcionario."));
	}

	if (!isLengthBetween(telefone, 10, 11)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Telefone deve ter 10 ou 11 numeros."));
	}

	if (email && !isLengthBetween(email, 5, 80)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "E-mail deve ter entre 5 e 80 caracteres."));
	}

	if (cpf.length !== 11) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "CPF deve conter 11 digitos."));
	}

	if (rg && !isLengthBetween(rg, 5, 14)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "RG deve ter entre 5 e 14 numeros."));
	}

	if (dataNascimento && !isValidDate(dataNascimento)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Informe uma data de nascimento valida."));
	}

	if (!isValidDate(dataAdmissao)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Informe uma data de admissao valida."));
	}

	if (dataDemissao && !isValidDate(dataDemissao)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Informe uma data de demissao valida."));
	}

	if (dataDemissao && new Date(`${dataDemissao}T00:00:00`) < new Date(`${dataAdmissao}T00:00:00`)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Data de demissao nao pode ser anterior a admissao."));
	}

	if (Number.isNaN(salarioBase) || salarioBase < 0) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Salario base deve ser maior ou igual a zero."));
	}

	if (Number.isNaN(percentualComissao) || percentualComissao < 0 || percentualComissao > 100) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Comissao deve estar entre 0 e 100."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Informe um status valido para o funcionario."));
	}

	if (observacoes.length > 255) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Observacoes devem ter no maximo 255 caracteres."));
	}

	const values = [
		funcionario,
		apelido || null,
		codfuncaoFuncionario,
		telefone,
		email || null,
		cpf,
		rg || null,
		dataNascimento || null,
		dataAdmissao,
		dataDemissao || null,
		salarioBase,
		percentualComissao,
		observacoes || null,
		ativo,
	];

	const { error } = codfuncionario
		? await executeQuery(
				`update public.funcionarios
				set funcionario = $1, apelido = $2, codfuncao_funcionario = $3, telefone = $4, email = $5,
					cpf = $6, rg = $7, data_nascimento = $8, data_admissao = $9,
					data_demissao = $10, salario_base = $11, percentual_comissao = $12, observacoes = $13, ativo = $14
				where codfuncionario = $15`,
				[...values, codfuncionario]
			)
		: await executeQuery(
				`insert into public.funcionarios (
					funcionario, apelido, codfuncao_funcionario, telefone, email, cpf, rg, data_nascimento,
					data_admissao, data_demissao, salario_base, percentual_comissao, observacoes, ativo
				) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
				values
			);

	if (error) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", error.message));
	}

	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCIONARIOS_PATH, "success", codfuncionario ? "Funcionário atualizado com sucesso." : "Funcionário salvo com sucesso."));
}
