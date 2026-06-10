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

function hasOnlyDigitsAndFormatting(value: string) {
	return /^[\d\s()./+:-]+$/.test(value);
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
	const estadoCivil = getText(formData, "estado_civil");
	const endereco = getText(formData, "endereco");
	const numero = onlyDigits(getText(formData, "numero"));
	const complemento = getText(formData, "complemento");
	const bairro = getText(formData, "bairro");
	const cepRaw = getText(formData, "cep");
	const cep = onlyDigits(cepRaw);
	const codcidadeValue = getText(formData, "codcidade");
	const codcidade = Number(codcidadeValue);
	const codfuncaoFuncionarioValue = getText(formData, "codfuncao_funcionario");
	const codfuncaoFuncionario = Number(codfuncaoFuncionarioValue);
	const telefoneRaw = getText(formData, "telefone");
	const telefone = onlyDigits(telefoneRaw);
	const contato = getText(formData, "contato");
	const email = getText(formData, "email");
	const cpf = onlyDigits(getText(formData, "cpf"));
	const rg = onlyDigits(getText(formData, "rg"));
	const sexo = getText(formData, "sexo");
	const nacionalidade = getText(formData, "nacionalidade");
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

	if (estadoCivil && !["SOLTEIRO", "CASADO", "SEPARADO", "DIVORCIADO", "VIUVO", "OUTRO"].includes(estadoCivil)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Estado civil invalido."));
	}

	if (!isLengthBetween(endereco, 5, 80)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Endereco deve ter entre 5 e 80 caracteres."));
	}

	if (!isLengthBetween(numero, 1, 10)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Numero deve conter entre 1 e 10 digitos."));
	}

	if (complemento.length > 60) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Complemento deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(bairro, 5, 60)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Bairro deve ter entre 5 e 60 caracteres."));
	}

	if (cep.length !== 8 || !hasOnlyDigitsAndFormatting(cepRaw)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "CEP deve conter exatamente 8 digitos."));
	}

	if (!codcidadeValue || Number.isNaN(codcidade)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Selecione a cidade do funcionario."));
	}

	if (!codfuncaoFuncionarioValue || Number.isNaN(codfuncaoFuncionario)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Selecione a funcao do funcionario."));
	}

	if (!isLengthBetween(telefone, 10, 11) || !hasOnlyDigitsAndFormatting(telefoneRaw)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Telefone deve ter 10 ou 11 numeros."));
	}

	if (contato.length > 60) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Contato deve ter no maximo 60 caracteres."));
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

	if (sexo && !["MASCULINO", "FEMININO"].includes(sexo)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Sexo do funcionario invalido."));
	}

	if (nacionalidade && !isLengthBetween(nacionalidade, 5, 20)) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Nacionalidade deve ter entre 5 e 20 caracteres."));
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

	if (observacoes.length > 110) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", "Observacoes devem ter no maximo 110 caracteres."));
	}

	const values = [
		funcionario,
		apelido || null,
		estadoCivil || null,
		endereco,
		numero,
		complemento || null,
		bairro,
		cep,
		codcidade,
		codfuncaoFuncionario,
		telefone,
		contato || null,
		email || null,
		sexo || null,
		nacionalidade || null,
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
				set funcionario = $1, apelido = $2, estado_civil = $3, endereco = $4, numero = $5,
					complemento = $6, bairro = $7, cep = $8, codcidade = $9, codfuncao_funcionario = $10,
					telefone = $11, contato = $12, email = $13, sexo = $14, nacionalidade = $15, cpf = $16, rg = $17,
					data_nascimento = $18, data_admissao = $19, data_demissao = $20, salario_base = $21,
					percentual_comissao = $22, observacoes = $23, ativo = $24
				where codfuncionario = $25`,
				[...values, codfuncionario]
			)
		: await executeQuery(
				`insert into public.funcionarios (
					funcionario, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade,
					codfuncao_funcionario, telefone, contato, email, sexo, nacionalidade, cpf, rg, data_nascimento,
					data_admissao, data_demissao, salario_base, percentual_comissao, observacoes, ativo
				) values (
					$1, $2, $3, $4, $5, $6, $7, $8, $9,
					$10, $11, $12, $13, $14, $15, $16, $17,
					$18, $19, $20, $21, $22, $23, $24
				)`,
				values
			);

	if (error) {
		redirect(buildRedirect(FUNCIONARIOS_PATH, "error", error.message));
	}

	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCIONARIOS_PATH, "success", codfuncionario ? "Funcionário atualizado com sucesso." : "Funcionário salvo com sucesso."));
}
