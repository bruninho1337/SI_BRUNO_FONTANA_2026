"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const CONDICOES_PAGAMENTO_PATH = "/cadastro/condicoes-pagamento";
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

export async function createCondicaoPagamentoAction(formData: FormData) {
	return saveCondicaoPagamento(formData);
}

export async function updateCondicaoPagamentoAction(formData: FormData) {
	const codcondicaoPagamento = Number(getText(formData, "codcondicao_pagamento"));

	if (Number.isNaN(codcondicaoPagamento)) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Condicao de pagamento invalida para edicao."));
	}

	return saveCondicaoPagamento(formData, codcondicaoPagamento);
}

export async function deleteCondicaoPagamentoAction(formData: FormData) {
	const codcondicaoPagamento = Number(getText(formData, "codcondicao_pagamento"));

	if (Number.isNaN(codcondicaoPagamento)) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Condicao de pagamento invalida para exclusao."));
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("condicoes_pagamento")
		.delete()
		.eq("codcondicao_pagamento", codcondicaoPagamento);

	if (error) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", error.message));
	}

	revalidatePath(CONDICOES_PAGAMENTO_PATH);
	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "success", "Condicao de pagamento excluida com sucesso."));
}

async function saveCondicaoPagamento(formData: FormData, codcondicaoPagamento?: number) {
	const nome = getText(formData, "nome");
	const prazoDias = Number(getText(formData, "prazo_dias") || "0");
	const parcelas = Number(getText(formData, "parcelas") || "1");
	const juro = parseDecimal(formData.get("juro"));
	const multa = parseDecimal(formData.get("multa"));
	const desconto = parseDecimal(formData.get("desconto"));
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (nome.length < 2 || nome.length > 80) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Nome deve ter entre 2 e 80 caracteres."));
	}

	if (Number.isNaN(prazoDias) || prazoDias < 0) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Prazo deve ser maior ou igual a zero."));
	}

	if (Number.isNaN(parcelas) || parcelas < 1) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Parcelas deve ser maior ou igual a 1."));
	}

	if ([juro, multa, desconto].some((value) => Number.isNaN(value) || value < 0)) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Juro, multa e desconto devem ser valores maiores ou iguais a zero."));
	}

	const supabase = await createClient();
	const payload = {
		nome,
		prazo_dias: prazoDias,
		parcelas,
		juro,
		multa,
		desconto,
		ativo,
	};
	const { error } = codcondicaoPagamento
		? await supabase.from("condicoes_pagamento").update(payload).eq("codcondicao_pagamento", codcondicaoPagamento)
		: await supabase.from("condicoes_pagamento").insert(payload);

	if (error) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", error.message));
	}

	revalidatePath(CONDICOES_PAGAMENTO_PATH);
	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "success", codcondicaoPagamento ? "Condicao de pagamento atualizada com sucesso." : "Condicao de pagamento salva com sucesso."));
}
