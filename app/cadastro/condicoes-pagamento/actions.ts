"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { executeQuery, queryRows } from "@/lib/db";

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

	const { data: clientesVinculados, error: clientesError } = await queryRows(
		"select count(*)::int as total from public.clientes where codcondicao_pagamento = $1",
		[codcondicaoPagamento]
	);

	if (clientesError) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", clientesError.message));
	}

	const totalClientesVinculados = Number(clientesVinculados?.[0]?.total ?? 0);

	if (totalClientesVinculados > 0) {
		redirect(
			buildRedirect(
				CONDICOES_PAGAMENTO_PATH,
				"error",
				`Esta condicao de pagamento esta vinculada a ${totalClientesVinculados} cliente(s). Troque a condicao nesses clientes ou inative este cadastro.`
			)
		);
	}

	const { error } = await executeQuery(
		"delete from public.condicoes_pagamento where codcondicao_pagamento = $1",
		[codcondicaoPagamento]
	);

	if (error) {
		redirect(
			buildRedirect(
				CONDICOES_PAGAMENTO_PATH,
				"error",
				"Nao foi possivel excluir esta condicao de pagamento porque ela esta vinculada a outro cadastro."
			)
		);
	}

	revalidatePath(CONDICOES_PAGAMENTO_PATH);
	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "success", "Condicao de pagamento excluida com sucesso."));
}

async function saveCondicaoPagamento(formData: FormData, codcondicaoPagamento?: number) {
	const condicaoPagamento = getText(formData, "condicao_pagamento");
	const codformaPagamentoValue = getText(formData, "codforma_pagamento");
	const prazoDias = Number(getText(formData, "prazo_dias") || "0");
	const parcelas = Number(getText(formData, "parcelas") || "1");
	const juro = parseDecimal(formData.get("juro"));
	const multa = parseDecimal(formData.get("multa"));
	const desconto = parseDecimal(formData.get("desconto"));
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (condicaoPagamento.length < 2 || condicaoPagamento.length > 80) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Condicao de pagamento deve ter entre 2 e 80 caracteres."));
	}

	if (!codformaPagamentoValue || Number.isNaN(Number(codformaPagamentoValue))) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Selecione uma forma de pagamento valida."));
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

	const { error } = codcondicaoPagamento
		? await executeQuery(
				`update public.condicoes_pagamento
				set condicao_pagamento = $1, codforma_pagamento = $2, prazo_dias = $3, parcelas = $4,
					juro = $5, multa = $6, desconto = $7, ativo = $8
				where codcondicao_pagamento = $9`,
				[
					condicaoPagamento,
					Number(codformaPagamentoValue),
					prazoDias,
					parcelas,
					juro,
					multa,
					desconto,
					ativo,
					codcondicaoPagamento,
				]
			)
		: await executeQuery(
				`insert into public.condicoes_pagamento (
					condicao_pagamento, codforma_pagamento, prazo_dias, parcelas, juro, multa, desconto, ativo
				) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
				[condicaoPagamento, Number(codformaPagamentoValue), prazoDias, parcelas, juro, multa, desconto, ativo]
			);

	if (error) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", error.message));
	}

	revalidatePath(CONDICOES_PAGAMENTO_PATH);
	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "success", codcondicaoPagamento ? "Condicao de pagamento atualizada com sucesso." : "Condicao de pagamento salva com sucesso."));
}
