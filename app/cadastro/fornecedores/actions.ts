"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/database/db";

const FORNECEDORES_PATH = "/cadastro/fornecedores";

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

function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

function hasOnlyDigitsAndFormatting(value: string) {
	return /^[\d\s()./+:-]+$/.test(value);
}

export async function createFornecedorAction(formData: FormData) {
	return saveFornecedor(formData);
}

export async function updateFornecedorAction(formData: FormData) {
	const codfornecedor = Number(getText(formData, "codfornecedor"));

	if (Number.isNaN(codfornecedor)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Fornecedor invalido para edicao."));
	}

	return saveFornecedor(formData, codfornecedor);
}

export async function deleteFornecedorAction(formData: FormData) {
	const codfornecedor = Number(getText(formData, "codfornecedor"));

	if (Number.isNaN(codfornecedor)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Fornecedor invalido para exclusao."));
	}

	const { error } = await executeQuery("delete from public.fornecedores where codfornecedor = $1", [codfornecedor]);

	if (error) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", error.message));
	}

	revalidatePath(FORNECEDORES_PATH);
	redirect(buildRedirect(FORNECEDORES_PATH, "success", "Fornecedor excluido com sucesso."));
}

async function saveFornecedor(formData: FormData, codfornecedor?: number) {
	const tipo = getText(formData, "tipo").toUpperCase();
	const fornecedor = getText(formData, "fornecedor");
	const nomeFantasia = getText(formData, "nome_fantasia");
	const contato = getText(formData, "contato");
	const endereco = getText(formData, "endereco");
	const numero = onlyDigits(getText(formData, "numero"));
	const complemento = getText(formData, "complemento");
	const bairro = getText(formData, "bairro");
	const cepRaw = getText(formData, "cep");
	const cep = onlyDigits(cepRaw);
	const codcidadeValue = getText(formData, "codcidade");
	const codcidade = Number(codcidadeValue);
	const telefoneRaw = getText(formData, "telefone");
	const telefone = onlyDigits(telefoneRaw);
	const email = getText(formData, "email");
	const rgInscricaoEstadualRaw = getText(formData, "rg_inscricao_estadual");
	const rgInscricaoEstadual = onlyDigits(rgInscricaoEstadualRaw);
	const cpfCnpjRaw = getText(formData, "cpf_cnpj");
	const cpfCnpj = onlyDigits(cpfCnpjRaw);
	const observacoes = getText(formData, "observacoes");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!["FISICA", "JURIDICA"].includes(tipo)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Selecione o tipo do fornecedor."));
	}

	if (!isLengthBetween(fornecedor, 5, 80)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Fornecedor deve ter entre 5 e 80 caracteres."));
	}

	if (nomeFantasia.length > 80) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Nome fantasia deve ter no maximo 80 caracteres."));
	}

	if (contato.length > 60) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Contato deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(endereco, 5, 80)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Endereco deve ter entre 5 e 80 caracteres."));
	}

	if (!isLengthBetween(numero, 1, 10)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Numero deve conter entre 1 e 10 digitos."));
	}

	if (complemento.length > 60) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Complemento deve ter no maximo 60 caracteres."));
	}

	if (!isLengthBetween(bairro, 5, 60)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Bairro deve ter entre 5 e 60 caracteres."));
	}

	if (cep.length !== 8 || !hasOnlyDigitsAndFormatting(cepRaw)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "CEP deve conter exatamente 8 digitos."));
	}

	if (!codcidadeValue || Number.isNaN(codcidade)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Selecione a cidade do fornecedor."));
	}

	if (!isLengthBetween(telefone, 10, 11) || !hasOnlyDigitsAndFormatting(telefoneRaw)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Telefone deve ter 10 ou 11 numeros."));
	}

	if (!isLengthBetween(email, 5, 80)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "E-mail deve ter entre 5 e 80 caracteres."));
	}

	if (rgInscricaoEstadualRaw && (!isLengthBetween(rgInscricaoEstadual, 5, 14) || !hasOnlyDigitsAndFormatting(rgInscricaoEstadualRaw))) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "RG/Inscricao estadual deve conter apenas digitos e ter entre 5 e 14 numeros."));
	}

	if (cpfCnpjRaw && !hasOnlyDigitsAndFormatting(cpfCnpjRaw)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "CPF/CNPJ deve conter apenas digitos."));
	}

	if (cpfCnpj && ![11, 14].includes(cpfCnpj.length)) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "CPF deve conter 11 digitos ou CNPJ deve conter 14 digitos."));
	}

	if (observacoes.length > 110) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", "Observacoes devem ter no maximo 110 caracteres."));
	}

	const values = [
		tipo,
		fornecedor,
		nomeFantasia || null,
		contato || null,
		endereco,
		numero,
		complemento || null,
		bairro,
		cep,
		codcidade,
		telefone,
		email,
		rgInscricaoEstadual || null,
		cpfCnpj || null,
		observacoes || null,
		ativo,
	];

	const { error } = codfornecedor
		? await executeQuery(
				`update public.fornecedores
				set tipo = $1, fornecedor = $2, nome_fantasia = $3, contato = $4, endereco = $5,
					numero = $6, complemento = $7, bairro = $8, cep = $9, codcidade = $10,
					telefone = $11, email = $12, rg_inscricao_estadual = $13, cpf_cnpj = $14,
					observacoes = $15, ativo = $16
				where codfornecedor = $17`,
				[...values, codfornecedor]
			)
		: await executeQuery(
				`insert into public.fornecedores (
					tipo, fornecedor, nome_fantasia, contato, endereco, numero, complemento, bairro,
					cep, codcidade, telefone, email, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo
				) values (
					$1, $2, $3, $4, $5, $6, $7, $8,
					$9, $10, $11, $12, $13, $14, $15, $16
				)`,
				values
			);

	if (error) {
		redirect(buildRedirect(FORNECEDORES_PATH, "error", error.message));
	}

	revalidatePath(FORNECEDORES_PATH);
	redirect(buildRedirect(FORNECEDORES_PATH, "success", codfornecedor ? "Fornecedor atualizado com sucesso." : "Fornecedor salvo com sucesso."));
}
