"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery } from "@/lib/database/db";

const FORMAS_PAGAMENTO_PATH = "/cadastro/formas-pagamento";

const tiposFormaPagamento = [
	"DINHEIRO",
	"PIX",
	"CARTAO_CREDITO",
	"CARTAO_DEBITO",
	"BOLETO",
	"TRANSFERENCIA",
	"OUTROS",
];

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

export async function createFormaPagamentoAction(formData: FormData) {
	return saveFormaPagamento(formData);
}

export async function updateFormaPagamentoAction(formData: FormData) {
	const codformaPagamento = Number(getText(formData, "codforma_pagamento"));

	if (Number.isNaN(codformaPagamento)) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Forma de pagamento invalida para edicao."));
	}

	return saveFormaPagamento(formData, codformaPagamento);
}

export async function deleteFormaPagamentoAction(formData: FormData) {
	const codformaPagamento = Number(getText(formData, "codforma_pagamento"));

	if (Number.isNaN(codformaPagamento)) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Forma de pagamento invalida para exclusao."));
	}

	const { error } = await executeQuery(
		"delete from public.formas_pagamento where codforma_pagamento = $1",
		[codformaPagamento]
	);

	if (error) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", error.message));
	}

	revalidatePath(FORMAS_PAGAMENTO_PATH);
	redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "success", "Forma de pagamento excluida com sucesso."));
}

async function saveFormaPagamento(formData: FormData, codformaPagamento?: number) {
	const formaPagamento = getText(formData, "forma_pagamento");
	const tipo = getText(formData, "tipo").toUpperCase() || "OUTROS";
	const descricao = getText(formData, "descricao");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(formaPagamento, 2, 50)) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Forma de pagamento deve ter entre 2 e 50 caracteres."));
	}

	if (!tiposFormaPagamento.includes(tipo)) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Selecione um tipo valido para a forma de pagamento."));
	}

	if (descricao.length > 255) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	if (!["S", "N"].includes(ativo)) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", "Informe um status valido para a forma de pagamento."));
	}

	const { error } = codformaPagamento
		? await executeQuery(
				`update public.formas_pagamento
				set forma_pagamento = $1, tipo = $2, descricao = $3, ativo = $4
				where codforma_pagamento = $5`,
				[formaPagamento, tipo, descricao || null, ativo, codformaPagamento]
			)
		: await executeQuery(
				`insert into public.formas_pagamento (forma_pagamento, tipo, descricao, ativo)
				values ($1, $2, $3, $4)`,
				[formaPagamento, tipo, descricao || null, ativo]
			);

	if (error) {
		redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "error", error.message));
	}

	revalidatePath(FORMAS_PAGAMENTO_PATH);
	redirect(buildRedirect(FORMAS_PAGAMENTO_PATH, "success", codformaPagamento ? "Forma de pagamento atualizada com sucesso." : "Forma de pagamento salva com sucesso."));
}
