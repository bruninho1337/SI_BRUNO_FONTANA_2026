"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

	const supabase = await createClient();
	const { error } = await supabase.from("clientes").delete().eq("codcliente", codcliente);

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

	if (!isLengthBetween(telefone, 10, 11) || !hasOnlyDigitsAndFormatting(telefoneRaw)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Telefone deve conter apenas digitos e ter 10 ou 11 numeros."));
	}

	if (!isLengthBetween(email, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "E-mail deve ter entre 5 e 60 caracteres."));
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

	if (observacoes.length > 255) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Observacoes devem ter no maximo 255 caracteres."));
	}

	const supabase = await createClient();
	const payload = {
		tipo,
		cliente,
		apelido: apelido || null,
		estado_civil: tipo === "FISICA" ? estadoCivil || null : null,
		endereco,
		numero,
		complemento: complemento || null,
		bairro,
		cep,
		codcidade,
		telefone,
		email,
		sexo: tipo === "FISICA" ? sexo || null : null,
		nacionalidade: tipo === "FISICA" ? nacionalidade || null : null,
		data_nascimento: dataNascimento || null,
		rg_inscricao_estadual: rgInscricaoEstadual || null,
		cpf_cnpj: cpfCnpj || null,
		observacoes: observacoes || null,
		ativo,
	};

	const { error } = codcliente
		? await supabase.from("clientes").update(payload).eq("codcliente", codcliente)
		: await supabase.from("clientes").insert(payload);

	if (error) {
		redirect(buildRedirect(CLIENTES_PATH, "error", error.message));
	}

	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CLIENTES_PATH, "success", codcliente ? "Cliente atualizado com sucesso." : "Cliente salvo com sucesso."));
}
