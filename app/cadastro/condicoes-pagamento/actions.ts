"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, executeQuery, queryRows } from "@/lib/database/db";

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
	const text = String(value ?? "").trim();
	const normalized = text.includes(",")
		? text.replace(/\./g, "").replace(",", ".")
		: text;

	if (!normalized) {
		return 0;
	}

	return Number(normalized);
}

function parseParcelas(formData: FormData) {
	const numeros = formData.getAll("parcela_numero");
	const diasVencimento = formData.getAll("parcela_dias_vencimento");
	const formasPagamento = formData.getAll("parcela_codforma_pagamento");
	const percentuais = formData.getAll("parcela_percentual");

	if (
		numeros.length === 0 ||
		numeros.length !== diasVencimento.length ||
		numeros.length !== formasPagamento.length ||
		numeros.length !== percentuais.length
	) {
		return null;
	}

	return numeros.map((numero, index) => ({
		numParcela: Number(numero),
		diasVencimento: Number(diasVencimento[index]),
		codformaPagamento: Number(formasPagamento[index]),
		percentual: parseDecimal(percentuais[index]),
	}));
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
	const parcelasCondicao = parseParcelas(formData);
	const juro = parseDecimal(formData.get("juro"));
	const multa = parseDecimal(formData.get("multa"));
	const desconto = parseDecimal(formData.get("desconto"));
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (condicaoPagamento.length < 2 || condicaoPagamento.length > 50) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Condicao de pagamento deve ter entre 2 e 50 caracteres."));
	}

	if (!parcelasCondicao) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Adicione ao menos uma parcela valida."));
	}

	if ([juro, multa, desconto].some((value) => Number.isNaN(value) || value < 0)) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Juro, multa e desconto devem ser valores maiores ou iguais a zero."));
	}

	const parcelasInvalidas = parcelasCondicao.some(
		(parcela, index) =>
			parcela.numParcela !== index + 1 ||
			!Number.isInteger(parcela.diasVencimento) ||
			parcela.diasVencimento < 0 ||
			!Number.isInteger(parcela.codformaPagamento) ||
			parcela.codformaPagamento < 1 ||
			Number.isNaN(parcela.percentual) ||
			parcela.percentual <= 0 ||
			parcela.percentual > 100
	);

	if (parcelasInvalidas) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "Revise numero, vencimento, forma e percentual das parcelas."));
	}

	const totalPercentual = parcelasCondicao.reduce(
		(total, parcela) => total + parcela.percentual,
		0
	);

	if (Math.abs(totalPercentual - 100) > 0.01) {
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", "A soma dos percentuais das parcelas deve ser 100%."));
	}

	const prazoDias = Math.max(...parcelasCondicao.map((parcela) => parcela.diasVencimento));
	const codformaPagamento = parcelasCondicao[0].codformaPagamento;
	const client = await db.connect();

	try {
		await client.query("begin");

		let condicaoId = codcondicaoPagamento;

		if (condicaoId) {
			await client.query(
				`update public.condicoes_pagamento
				set condicao_pagamento = $1, codforma_pagamento = $2, prazo_dias = $3, parcelas = $4,
					juro = $5, multa = $6, desconto = $7, ativo = $8
				where codcondicao_pagamento = $9`,
				[
					condicaoPagamento,
					codformaPagamento,
					prazoDias,
					parcelasCondicao.length,
					juro,
					multa,
					desconto,
					ativo,
					condicaoId,
				]
			);

			await client.query(
				"delete from public.condicoes_pagamento_parcelas where codcondicao_pagamento = $1",
				[condicaoId]
			);
		} else {
			const result = await client.query<{ codcondicao_pagamento: number }>(
				`insert into public.condicoes_pagamento (
					condicao_pagamento, codforma_pagamento, prazo_dias, parcelas, juro, multa, desconto, ativo
				) values ($1, $2, $3, $4, $5, $6, $7, $8)
				returning codcondicao_pagamento`,
				[
					condicaoPagamento,
					codformaPagamento,
					prazoDias,
					parcelasCondicao.length,
					juro,
					multa,
					desconto,
					ativo,
				]
			);
			condicaoId = result.rows[0].codcondicao_pagamento;
		}

		for (const parcela of parcelasCondicao) {
			await client.query(
				`insert into public.condicoes_pagamento_parcelas (
					codcondicao_pagamento, num_parcela, dias_vencimento, codforma_pagamento, percentual
				) values ($1, $2, $3, $4, $5)`,
				[
					condicaoId,
					parcela.numParcela,
					parcela.diasVencimento,
					parcela.codformaPagamento,
					parcela.percentual,
				]
			);
		}

		await client.query("commit");
	} catch (error) {
		await client.query("rollback");
		const message = error instanceof Error ? error.message : "Erro ao salvar condicao de pagamento.";
		redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "error", message));
	} finally {
		client.release();
	}

	revalidatePath(CONDICOES_PAGAMENTO_PATH);
	revalidatePath(CLIENTES_PATH);
	redirect(buildRedirect(CONDICOES_PAGAMENTO_PATH, "success", codcondicaoPagamento ? "Condicao de pagamento atualizada com sucesso." : "Condicao de pagamento salva com sucesso."));
}
