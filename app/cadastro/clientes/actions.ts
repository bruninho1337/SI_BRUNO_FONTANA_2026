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
	const tipo = getText(formData, "tipo").toUpperCase();
	const cliente = getText(formData, "cliente");
	const apelido = getText(formData, "apelido");
	const estadoCivil = getText(formData, "estado_civil");
	const endereco = getText(formData, "endereco");
	const numero = getText(formData, "numero");
	const complemento = getText(formData, "complemento");
	const bairro = getText(formData, "bairro");
	const cep = getText(formData, "cep");
	const codcidadeValue = getText(formData, "codcidade");
	const codcidade = Number(codcidadeValue);
	const telefone = getText(formData, "telefone");
	const email = getText(formData, "email");
	const sexo = getText(formData, "sexo");
	const nacionalidade = getText(formData, "nacionalidade");
	const dataNascimento = getText(formData, "data_nascimento");
	const rgInscricaoEstadual = getText(formData, "rg_inscricao_estadual");
	const cpfCnpj = getText(formData, "cpf_cnpj");
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

	if (!isLengthBetween(numero, 1, 10)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Numero deve ter entre 1 e 10 caracteres."));
	}

	if (complemento.length > 60) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Complemento deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(bairro, 5, 60)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Bairro deve ter entre 5 e 60 caracteres."));
	}

	if (!isLengthBetween(cep, 8, 9)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CEP deve ter entre 8 e 9 caracteres."));
	}

	if (!codcidadeValue || Number.isNaN(codcidade)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Selecione a cidade do cliente."));
	}

	if (!isLengthBetween(telefone, 5, 20)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Telefone deve ter entre 5 e 20 caracteres."));
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

	if (!isOptionalLengthBetween(rgInscricaoEstadual, 5, 14)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "RG/Inscricao estadual deve ter entre 5 e 14 caracteres."));
	}

	if (!isOptionalLengthBetween(cpfCnpj, 5, 14)) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "CPF/CNPJ deve ter entre 5 e 14 caracteres."));
	}

	if (observacoes.length > 255) {
		redirect(buildRedirect(CLIENTES_PATH, "error", "Observacoes devem ter no maximo 255 caracteres."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("clientes").insert({
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
	});

	if (error) {
		redirect(buildRedirect(CLIENTES_PATH, "error", error.message));
	}

	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CLIENTES_PATH, "success", "Cliente salvo com sucesso."));
}
