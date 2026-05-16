"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/db";

const CLIENTES_PATH = "/cadastro/clientes";

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

function isOptionalLengthBetween(value: string, min: number, max: number) {
	return !value || isLengthBetween(value, min, max);
}

function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

function hasOnlyDigits(value: string) {
	return /^\d+$/.test(value);
}

function hasOnlyDigitsAndFormatting(value: string) {
	return /^[\d\s().+-]+$/.test(value);
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

function isOlderThan15(dateValue: string) {
	if (!dateValue) {
		return true;
	}

	const birthDate = new Date(`${dateValue}T00:00:00`);

	if (Number.isNaN(birthDate.getTime())) {
		return false;
	}

	const today = new Date();
	const minimumBirthDate = new Date(
		today.getFullYear() - 15,
		today.getMonth(),
		today.getDate()
	);

	return birthDate < minimumBirthDate;
}

export async function createClienteAction(formData: FormData) {
	return saveCliente(formData);
}

export async function updateClienteAction(formData: FormData) {
	const codcliente = Number(getText(formData, "codcliente"));

	if (Number.isNaN(codcliente)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Cliente invalido para edicao."));
	}

	return saveCliente(formData, codcliente);
}

export async function deleteClienteAction(formData: FormData) {
	const codcliente = Number(getText(formData, "codcliente"));

	if (Number.isNaN(codcliente)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Cliente invalido para exclusao."));
	}

	const { error } = await executeQuery("delete from public.clientes where codcliente = $1", [codcliente]);

	if (error) {
		redirect(buildRedirect(CLIENTES_PATH, "error", error.message));
	}

	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CLIENTES_PATH, "success", "Cliente excluido com sucesso."));
}

async function saveCliente(formData: FormData, codcliente?: number) {
	const tipo = getText(formData, "tipo").toUpperCase();
	const cliente = getText(formData, "cliente");
	const apelido = getText(formData, "apelido");
	const estadoCivil = getText(formData, "estado_civil");
	const endereco = getText(formData, "endereco");
	const numeroRaw = getText(formData, "numero");
	const numero = onlyDigits(numeroRaw);
	const complemento = getText(formData, "complemento");
	const bairro = getText(formData, "bairro");
	const cepRaw = getText(formData, "cep");
	const cep = onlyDigits(cepRaw);
	const codcidadeValue = getText(formData, "codcidade");
	const codcidade = Number(codcidadeValue);
	const codcondicaoPagamentoValue = getText(formData, "codcondicao_pagamento");
	const codcondicaoPagamento = Number(codcondicaoPagamentoValue);
	const telefoneRaw = getText(formData, "telefone");
	const telefone = onlyDigits(telefoneRaw);
	const email = getText(formData, "email");
	const sexo = getText(formData, "sexo");
	const nacionalidade = getText(formData, "nacionalidade");
	const dataNascimento = getText(formData, "data_nascimento");
	const rgInscricaoEstadualRaw = getText(formData, "rg_inscricao_estadual");
	const rgInscricaoEstadual = onlyDigits(rgInscricaoEstadualRaw);
	const cpfCnpjRaw = getText(formData, "cpf_cnpj");
	const cpfCnpj = onlyDigits(cpfCnpjRaw);
	const observacoes = getText(formData, "observacoes");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!["FISICA", "JURIDICA"].includes(tipo)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Selecione o tipo do cliente."));
	}

	if (!isLengthBetween(cliente, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Cliente deve ter entre 5 e 60 caracteres."));
	}

	if (apelido.length > 60) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Apelido deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(endereco, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Endereco deve ter entre 5 e 60 caracteres."));
	}

	if (!isLengthBetween(numero, 1, 10) || !hasOnlyDigits(numeroRaw)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Numero deve conter apenas digitos e ter entre 1 e 10 caracteres."));
	}

	if (complemento.length > 60) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Complemento deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(bairro, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Bairro deve ter entre 5 e 60 caracteres."));
	}

	if (cep.length !== 8 || !hasOnlyDigitsAndFormatting(cepRaw)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CEP deve conter exatamente 8 digitos."));
	}

	if (!codcidadeValue || Number.isNaN(codcidade)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Selecione a cidade do cliente."));
	}

	if (!codcondicaoPagamentoValue || Number.isNaN(codcondicaoPagamento)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Selecione a condicao de pagamento do cliente."));
	}

	if (!isLengthBetween(telefone, 10, 11) || !hasOnlyDigitsAndFormatting(telefoneRaw)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Telefone deve conter apenas digitos e ter 10 ou 11 numeros."));
	}

	if (!isLengthBetween(email, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "E-mail deve ter entre 5 e 60 caracteres."));
	}

	if (tipo === "FISICA" && !["MASCULINO", "FEMININO"].includes(sexo)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Selecione o sexo do cliente."));
	}

	if (!isOptionalLengthBetween(nacionalidade, 5, 20)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Nacionalidade deve ter entre 5 e 20 caracteres."));
	}

	if (!isOlderThan15(dataNascimento)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Data de nascimento exige idade maior que 15 anos."));
	}

	if (!isOptionalLengthBetween(rgInscricaoEstadual, 5, 14) || (rgInscricaoEstadualRaw && !hasOnlyDigitsAndFormatting(rgInscricaoEstadualRaw))) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "RG/Inscricao estadual deve conter apenas digitos e ter entre 5 e 14 numeros."));
	}

	if (cpfCnpjRaw && !hasOnlyDigitsAndFormatting(cpfCnpjRaw)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CPF/CNPJ deve conter apenas digitos."));
	}

	if (cpfCnpj && ![11, 14].includes(cpfCnpj.length)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CPF deve conter 11 digitos ou CNPJ deve conter 14 digitos."));
	}

	if (cpfCnpj && tipo === "FISICA" && cpfCnpj.length !== 11) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Cliente pessoa fisica deve informar um CPF com 11 digitos."));
	}

	if (cpfCnpj && tipo === "JURIDICA" && cpfCnpj.length !== 14) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Cliente pessoa juridica deve informar um CNPJ com 14 digitos."));
	}

	if (cpfCnpj.length === 11 && !isValidCpf(cpfCnpj)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CPF invalido."));
	}

	if (cpfCnpj.length === 14 && !isValidCnpj(cpfCnpj)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CNPJ invalido."));
	}

	if (observacoes.length > 255) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Observacoes devem ter no maximo 255 caracteres."));
	}

	const { error } = codcliente
		? await executeQuery(
				`update public.clientes
				set tipo = $1, cliente = $2, apelido = $3, estado_civil = $4, endereco = $5, numero = $6,
					complemento = $7, bairro = $8, cep = $9, codcidade = $10, codcondicao_pagamento = $11,
					telefone = $12, email = $13, sexo = $14, nacionalidade = $15, data_nascimento = $16,
					rg_inscricao_estadual = $17, cpf_cnpj = $18, observacoes = $19, ativo = $20
				where codcliente = $21`,
				[
					tipo,
					cliente,
					apelido || null,
					tipo === "FISICA" ? estadoCivil || null : null,
					endereco,
					numero,
					complemento || null,
					bairro,
					cep,
					codcidade,
					codcondicaoPagamento,
					telefone,
					email,
					tipo === "FISICA" ? sexo || null : null,
					tipo === "FISICA" ? nacionalidade || null : null,
					dataNascimento || null,
					rgInscricaoEstadual || null,
					cpfCnpj || null,
					observacoes || null,
					ativo,
					codcliente,
				]
			)
		: await executeQuery(
				`insert into public.clientes (
					tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro, cep,
					codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade, data_nascimento,
					rg_inscricao_estadual, cpf_cnpj, observacoes, ativo
				) values (
					$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
					$11, $12, $13, $14, $15, $16, $17, $18, $19, $20
				)`,
				[
					tipo,
					cliente,
					apelido || null,
					tipo === "FISICA" ? estadoCivil || null : null,
					endereco,
					numero,
					complemento || null,
					bairro,
					cep,
					codcidade,
					codcondicaoPagamento,
					telefone,
					email,
					tipo === "FISICA" ? sexo || null : null,
					tipo === "FISICA" ? nacionalidade || null : null,
					dataNascimento || null,
					rgInscricaoEstadual || null,
					cpfCnpj || null,
					observacoes || null,
					ativo,
				]
			);

	if (error) {
		redirect(buildRedirect(CLIENTES_PATH, "error", error.message));
	}

	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CLIENTES_PATH, "success", codcliente ? "Cliente atualizado com sucesso." : "Cliente salvo com sucesso."));
}
