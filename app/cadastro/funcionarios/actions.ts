"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/database/db";

const FUNCIONARIOS_PATH = "/cadastro/funcionarios";

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	const separator = path.includes("?") ? "&" : "?";

	return `${path}${separator}${params.toString()}`;
}

function getText(formData: FormData, name: string) {
	return String(formData.get(name) ?? "").trim();
}
function getErrorPath(formData: FormData, fallbackPath: string) {
	const path = getText(formData, "_form_error_url");

	return path === fallbackPath || path.startsWith(`${fallbackPath}?`) ? path : fallbackPath;
}


function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

function hasOnlyDigitsAndFormatting(value: string) {
	return /^[\d\s()./+:-]+$/.test(value);
}

function hasRepeatedDigits(value: string) {
	return /^(\d)\1+$/.test(value);
}

function isValidCpf(value: string) {
	if (value.length !== 11 || hasRepeatedDigits(value)) {
		return false;
	}

	const digits = value.split("").map(Number);
	const firstCheckSum = digits
		.slice(0, 9)
		.reduce((sum, digit, index) => sum + digit * (10 - index), 0);
	const firstCheckDigit = (firstCheckSum * 10) % 11;

	if ((firstCheckDigit === 10 ? 0 : firstCheckDigit) !== digits[9]) {
		return false;
	}

	const secondCheckSum = digits
		.slice(0, 10)
		.reduce((sum, digit, index) => sum + digit * (11 - index), 0);
	const secondCheckDigit = (secondCheckSum * 10) % 11;

	return (secondCheckDigit === 10 ? 0 : secondCheckDigit) === digits[10];
}

function isValidCnpj(value: string) {
	if (value.length !== 14 || hasRepeatedDigits(value)) {
		return false;
	}

	const digits = value.split("").map(Number);
	const getCheckDigit = (baseDigits: number[], weights: number[]) => {
		const sum = baseDigits.reduce(
			(total, digit, index) => total + digit * weights[index],
			0
		);
		const remainder = sum % 11;

		return remainder < 2 ? 0 : 11 - remainder;
	};

	const firstCheckDigit = getCheckDigit(
		digits.slice(0, 12),
		[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	);

	if (firstCheckDigit !== digits[12]) {
		return false;
	}

	const secondCheckDigit = getCheckDigit(
		digits.slice(0, 13),
		[6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	);

	return secondCheckDigit === digits[13];
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
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Funcionário invalido para edicao."));
	}

	return saveFuncionario(formData, codfuncionario);
}

export async function deleteFuncionarioAction(formData: FormData) {
	const codfuncionario = Number(getText(formData, "codfuncionario"));

	if (Number.isNaN(codfuncionario)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Funcionário invalido para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.funcionarios where codfuncionario = $1",
		[codfuncionario]
	);

	if (error) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", error.message));
	}

	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCIONARIOS_PATH, "success", "Funcionário excluido com sucesso."));
}

async function saveFuncionario(formData: FormData, codfuncionario?: number) {
	const tipo = getText(formData, "tipo").toUpperCase();
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
	const cpfRaw = getText(formData, "cpf");
	const cpf = onlyDigits(cpfRaw);
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

	if (!["FISICA", "JURIDICA"].includes(tipo)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Selecione o tipo do funcionario."));
	}

	if (!isLengthBetween(funcionario, 5, 60)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Funcionário deve ter entre 5 e 60 caracteres."));
	}

	if (apelido.length > 35) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Apelido deve ter no maximo 35 caracteres."));
	}

	if (tipo === "FISICA" && estadoCivil && !["SOLTEIRO", "CASADO", "SEPARADO", "DIVORCIADO", "VIUVO", "OUTRO"].includes(estadoCivil)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Estado civil invalido."));
	}

	if (!isLengthBetween(endereco, 5, 80)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Endereco deve ter entre 5 e 80 caracteres."));
	}

	if (!isLengthBetween(numero, 1, 10)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Numero deve conter entre 1 e 10 digitos."));
	}

	if (complemento.length > 60) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Complemento deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(bairro, 5, 60)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Bairro deve ter entre 5 e 60 caracteres."));
	}

	if (cep.length !== 8 || !hasOnlyDigitsAndFormatting(cepRaw)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "CEP deve conter exatamente 8 digitos."));
	}

	if (!codcidadeValue || Number.isNaN(codcidade)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Selecione a cidade do funcionario."));
	}

	if (!codfuncaoFuncionarioValue || Number.isNaN(codfuncaoFuncionario)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Selecione a funcao do funcionario."));
	}

	if (!isLengthBetween(telefone, 10, 11) || !hasOnlyDigitsAndFormatting(telefoneRaw)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Telefone deve ter 10 ou 11 numeros."));
	}

	if (contato.length > 60) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Contato deve ter no maximo 60 caracteres."));
	}

	if (email && !isLengthBetween(email, 5, 80)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "E-mail deve ter entre 5 e 80 caracteres."));
	}

	if (cpfRaw && !hasOnlyDigitsAndFormatting(cpfRaw)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "CPF/CNPJ deve conter apenas digitos."));
	}

	if (cpf && ![11, 14].includes(cpf.length)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "CPF deve conter 11 digitos ou CNPJ deve conter 14 digitos."));
	}

	if (tipo === "FISICA" && cpf.length !== 11) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Funcionario pessoa fisica deve informar um CPF com 11 digitos."));
	}

	if (tipo === "JURIDICA" && cpf.length !== 14) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Funcionario pessoa juridica deve informar um CNPJ com 14 digitos."));
	}

	if (cpf.length === 11 && !isValidCpf(cpf)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "CPF invalido."));
	}

	if (cpf.length === 14 && !isValidCnpj(cpf)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "CNPJ invalido."));
	}

	if (rg && !isLengthBetween(rg, 5, 14)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "RG/Inscricao estadual deve ter entre 5 e 14 numeros."));
	}

	if (tipo === "FISICA" && sexo && !["MASCULINO", "FEMININO"].includes(sexo)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Sexo do funcionario invalido."));
	}

	if (tipo === "FISICA" && nacionalidade && !isLengthBetween(nacionalidade, 5, 20)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Nacionalidade deve ter entre 5 e 20 caracteres."));
	}

	if (tipo === "FISICA" && dataNascimento && !isValidDate(dataNascimento)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Informe uma data de nascimento valida."));
	}

	if (!isValidDate(dataAdmissao)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Informe uma data de admissao valida."));
	}

	if (dataDemissao && !isValidDate(dataDemissao)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Informe uma data de demissao valida."));
	}

	if (dataDemissao && new Date(`${dataDemissao}T00:00:00`) < new Date(`${dataAdmissao}T00:00:00`)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Data de demissao nao pode ser anterior a admissao."));
	}

	if (Number.isNaN(salarioBase) || salarioBase < 0) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Salario base deve ser maior ou igual a zero."));
	}

	if (Number.isNaN(percentualComissao) || percentualComissao < 0 || percentualComissao > 100) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Comissao deve estar entre 0 e 100."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Informe um status valido para o funcionario."));
	}

	if (observacoes.length > 110) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", "Observacoes devem ter no maximo 110 caracteres."));
	}

	const values = [
		tipo,
		funcionario,
		apelido || null,
		tipo === "FISICA" ? estadoCivil || null : null,
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
		tipo === "FISICA" ? sexo || null : null,
		tipo === "FISICA" ? nacionalidade || null : null,
		cpf,
		rg || null,
		tipo === "FISICA" ? dataNascimento || null : null,
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
				set tipo = $1, funcionario = $2, apelido = $3, estado_civil = $4, endereco = $5, numero = $6,
					complemento = $7, bairro = $8, cep = $9, codcidade = $10, codfuncao_funcionario = $11,
					telefone = $12, contato = $13, email = $14, sexo = $15, nacionalidade = $16, cpf = $17, rg = $18,
					data_nascimento = $19, data_admissao = $20, data_demissao = $21, salario_base = $22,
					percentual_comissao = $23, observacoes = $24, ativo = $25
				where codfuncionario = $26`,
				[...values, codfuncionario]
			)
		: await executeQuery(
				`insert into public.funcionarios (
					tipo, funcionario, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade,
					codfuncao_funcionario, telefone, contato, email, sexo, nacionalidade, cpf, rg, data_nascimento,
					data_admissao, data_demissao, salario_base, percentual_comissao, observacoes, ativo
				) values (
					$1, $2, $3, $4, $5, $6, $7, $8, $9,
					$10, $11, $12, $13, $14, $15, $16, $17,
					$18, $19, $20, $21, $22, $23, $24, $25
				)`,
				values
			);

	if (error) {
		redirect(buildRedirect(getErrorPath(formData, FUNCIONARIOS_PATH), "error", error.message));
	}

	revalidatePath(FUNCIONARIOS_PATH);
	redirect(buildRedirect(FUNCIONARIOS_PATH, "success", codfuncionario ? "Funcionário atualizado com sucesso." : "Funcionário salvo com sucesso."));
}
