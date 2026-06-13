"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/database/db";

const CONTAS_PAGAR_PATH = "/cadastro/contas-pagar";

const statusOptions = ["PENDENTE", "PAGO", "CANCELADO"];

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	return `${path}?${params.toString()}`;
}

function getText(formData: FormData, name: string) {
	return String(formData.get(name) ?? "").trim();
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

export async function createContaPagarAction(formData: FormData) {
	return saveContaPagar(formData);
}

export async function updateContaPagarAction(formData: FormData) {
	const codcontaPagar = Number(getText(formData, "codconta_pagar"));

	if (Number.isNaN(codcontaPagar)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Conta a pagar invalida para edicao."));
	}

	return saveContaPagar(formData, codcontaPagar);
}

export async function deleteContaPagarAction(formData: FormData) {
	const codcontaPagar = Number(getText(formData, "codconta_pagar"));

	if (Number.isNaN(codcontaPagar)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Conta a pagar invalida para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.contas_pagar where codconta_pagar = $1",
		[codcontaPagar]
	);

	if (error) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", error.message));
	}

	revalidatePath(CONTAS_PAGAR_PATH);
	redirect(buildRedirect(CONTAS_PAGAR_PATH, "success", "Conta a pagar excluida com sucesso."));
}

async function saveContaPagar(formData: FormData, codcontaPagar?: number) {
	const contaPagar = getText(formData, "conta_pagar");
	const codfornecedorValue = getText(formData, "codfornecedor");
	const codformaPagamentoValue = getText(formData, "codforma_pagamento");
	const numeroDocumento = getText(formData, "numero_documento");
	const dataEmissao = getText(formData, "data_emissao");
	const dataVencimento = getText(formData, "data_vencimento");
	const dataPagamento = getText(formData, "data_pagamento");
	const valor = parseDecimal(formData.get("valor"));
	const valorPago = parseDecimal(formData.get("valor_pago"));
	const status = getText(formData, "status").toUpperCase() || "PENDENTE";
	const ativo = getText(formData, "ativo").toUpperCase() || "S";
	const observacoes = getText(formData, "observacoes");
	const codfornecedor = Number(codfornecedorValue);
	const codformaPagamento = Number(codformaPagamentoValue);

	if (!isLengthBetween(contaPagar, 2, 120)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Conta a pagar deve ter entre 2 e 120 caracteres."));
	}

	if (!codfornecedorValue || Number.isNaN(codfornecedor)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Selecione o fornecedor da conta."));
	}

	if (codformaPagamentoValue && Number.isNaN(codformaPagamento)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Forma de pagamento invalida."));
	}

	if (numeroDocumento.length > 60) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Documento deve ter no maximo 60 caracteres."));
	}

	if (!isValidDate(dataEmissao)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Informe uma data de emissao valida."));
	}

	if (!isValidDate(dataVencimento)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Informe uma data de vencimento valida."));
	}

	if (dataPagamento && !isValidDate(dataPagamento)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Informe uma data de pagamento valida."));
	}

	if (Number.isNaN(valor) || valor <= 0) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Valor deve ser maior que zero."));
	}

	if (Number.isNaN(valorPago) || valorPago < 0 || valorPago > valor) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Valor pago deve estar entre 0 e o valor da conta."));
	}

	if (!statusOptions.includes(status)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Selecione um status valido."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Informe um status ativo valido para a conta."));
	}

	if (status === "PAGO" && valorPago <= 0) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Informe o valor pago para contas pagas."));
	}

	if (observacoes.length > 110) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", "Observacoes devem ter no maximo 110 caracteres."));
	}

	const values = [
		contaPagar,
		codfornecedor,
		codformaPagamentoValue ? codformaPagamento : null,
		numeroDocumento || null,
		dataEmissao,
		dataVencimento,
		dataPagamento || null,
		valor,
		valorPago,
		status,
		ativo,
		observacoes || null,
	];

	const { error } = codcontaPagar
		? await executeQuery(
				`update public.contas_pagar
				set conta_pagar = $1, codfornecedor = $2, codforma_pagamento = $3,
					numero_documento = $4, data_emissao = $5, data_vencimento = $6,
					data_pagamento = $7, valor = $8, valor_pago = $9, status = $10,
					ativo = $11, observacoes = $12
				where codconta_pagar = $13`,
				[...values, codcontaPagar]
			)
		: await executeQuery(
				`insert into public.contas_pagar (
					conta_pagar, codfornecedor, codforma_pagamento, numero_documento,
					data_emissao, data_vencimento, data_pagamento, valor, valor_pago,
					status, ativo, observacoes
				) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
				values
			);

	if (error) {
		redirect(buildRedirect(CONTAS_PAGAR_PATH, "error", error.message));
	}

	revalidatePath(CONTAS_PAGAR_PATH);
	redirect(buildRedirect(CONTAS_PAGAR_PATH, "success", codcontaPagar ? "Conta a pagar atualizada com sucesso." : "Conta a pagar salva com sucesso."));
}
