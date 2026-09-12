"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { allocateMoney, addDays, isIsoDate, purchaseToday, roundMoney, type PaymentTerm } from "@/lib/compras-calculos";
import { db } from "@/lib/database/db";

const COMPRAS_PATH = "/cadastro/compras";

type SubmittedItem = {
	codproduto?: number | string;
	quantidade?: number | string;
	valor_unitario?: number | string;
	valor_desconto?: number | string;
};

function getText(formData: FormData, name: string) {
	return String(formData.get(name) ?? "").trim();
}

function getErrorPath(formData: FormData) {
	const path = getText(formData, "_form_error_url");

	return path === COMPRAS_PATH || path.startsWith(`${COMPRAS_PATH}?`)
		? path
		: `${COMPRAS_PATH}?mode=create`;
}

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({ [type]: message });
	const separator = path.includes("?") ? "&" : "?";

	return `${path}${separator}${params.toString()}`;
}

function fail(formData: FormData, message: string): never {
	redirect(buildRedirect(getErrorPath(formData), "error", message));
}

function parseDecimal(value: unknown) {
	if (typeof value === "number") return value;
	const normalized = String(value ?? "")
		.trim()
		.replace(/\./g, "")
		.replace(",", ".");

	return normalized ? Number(normalized) : 0;
}

function databaseMessage(error: unknown) {
	const dbError = error as { code?: string; constraint?: string; message?: string };

	if (dbError.code === "23505" && ["compras_pkey", "compras_nota_fornecedor_unique_idx"].includes(dbError.constraint ?? "")) {
		return "Ja existe uma compra com este fornecedor, modelo, serie e numero de nota.";
	}

	if (dbError.code === "23503") {
		return "Fornecedor, condicao de pagamento ou produto nao esta mais disponivel.";
	}

	return dbError.message ?? "Nao foi possivel salvar a compra.";
}

export async function validateCompraKeyAction(key: { codfornecedor: string; modelo: string; serie: string; numeroNota: string }) {
	const supplier = Number(key.codfornecedor);
	if (!Number.isSafeInteger(supplier) || supplier <= 0 || !key.modelo.trim() || key.modelo.trim().length > 10 || !key.serie.trim() || key.serie.trim().length > 10 || !key.numeroNota.trim() || key.numeroNota.trim().length > 30) {
		return { valid: false, message: "Preencha fornecedor, modelo, série e número da nota." };
	}
	try {
		const result = await db.query(`select 1 from public.compras where codfornecedor = $1
			and lower(btrim(modelo)) = lower(btrim($2)) and lower(btrim(serie)) = lower(btrim($3))
			and lower(btrim(numero_nota)) = lower(btrim($4))`, [supplier, key.modelo, key.serie, key.numeroNota]);
		return result.rowCount ? { valid: false, message: "Já existe uma compra com esta chave, inclusive se cancelada." } : { valid: true, message: "Nota validada. Preencha os dados da compra." };
	} catch {
		return { valid: false, message: "Não foi possível validar a nota. Tente novamente." };
	}
}

export async function createCompraAction(formData: FormData) {
	const codfornecedorValue = getText(formData, "codfornecedor");
	const codcondicaoValue = getText(formData, "codcondicao_pagamento");
	const modelo = getText(formData, "modelo");
	const serie = getText(formData, "serie");
	const numeroNota = getText(formData, "numero_nota");
	const dataEmissao = getText(formData, "data_emissao");
	const dataChegada = getText(formData, "data_chegada");
	const observacoes = getText(formData, "observacoes");
	const valorFrete = roundMoney(parseDecimal(formData.get("valor_frete")));
	const valorSeguro = roundMoney(parseDecimal(formData.get("valor_seguro")));
	const outrasDespesas = roundMoney(parseDecimal(formData.get("outras_despesas")));
	const valorDesconto = roundMoney(parseDecimal(formData.get("valor_desconto")));
	const codfornecedor = Number(codfornecedorValue);
	const codcondicaoPagamento = Number(codcondicaoValue);

	if (!codfornecedorValue || !Number.isInteger(codfornecedor) || codfornecedor <= 0) {
		fail(formData, "Selecione o fornecedor da compra.");
	}

	if (!codcondicaoValue || !Number.isInteger(codcondicaoPagamento) || codcondicaoPagamento <= 0) {
		fail(formData, "Selecione a condicao de pagamento.");
	}

	if (modelo.length < 1 || modelo.length > 10) {
		fail(formData, "Modelo da nota deve ter entre 1 e 10 caracteres.");
	}

	if (serie.length < 1 || serie.length > 10) {
		fail(formData, "Serie da nota deve ter entre 1 e 10 caracteres.");
	}

	if (numeroNota.length < 1 || numeroNota.length > 30) {
		fail(formData, "Numero da nota deve ter entre 1 e 30 caracteres.");
	}

	if (!isIsoDate(dataEmissao) || dataEmissao > purchaseToday()) {
		fail(formData, "A data de emissao deve ser valida e nao pode estar no futuro.");
	}

	if (!isIsoDate(dataChegada) || dataChegada < dataEmissao) {
		fail(formData, "A data de chegada deve ser igual ou posterior a emissao.");
	}

	if ([valorFrete, valorSeguro, outrasDespesas, valorDesconto].some((value) => !Number.isFinite(value) || value < 0)) {
		fail(formData, "Frete, seguro, despesas e desconto devem ser valores positivos.");
	}

	if (observacoes.length > 255) {
		fail(formData, "Observacoes devem ter no maximo 255 caracteres.");
	}

	let submittedItems: SubmittedItem[];

	try {
		const parsed = JSON.parse(getText(formData, "itens_json"));
		submittedItems = Array.isArray(parsed) ? parsed : [];
	} catch {
		fail(formData, "Os itens da compra estao invalidos.");
	}

	if (submittedItems.length === 0 || submittedItems.some((item) => !item || typeof item !== "object")) {
		fail(formData, "Adicione ao menos um item a compra.");
	}

	const items = submittedItems.map((item) => ({
		codproduto: Number(item.codproduto),
		quantidade: Number(item.quantidade),
		valorUnitario: roundMoney(parseDecimal(item.valor_unitario)),
		valorDesconto: roundMoney(parseDecimal(item.valor_desconto)),
	}));
	const productIds = items.map((item) => item.codproduto);

	if (items.some((item) => !Number.isInteger(item.codproduto) || item.codproduto <= 0)) {
		fail(formData, "Selecione um produto valido em todos os itens.");
	}

	if (new Set(productIds).size !== productIds.length) {
		fail(formData, "Cada produto deve aparecer apenas uma vez na compra.");
	}

	if (items.some((item) => !Number.isInteger(item.quantidade) || item.quantidade <= 0)) {
		fail(formData, "A quantidade dos itens deve ser um numero inteiro maior que zero.");
	}

	if (items.some((item) => !Number.isFinite(item.valorUnitario) || item.valorUnitario < 0)) {
		fail(formData, "O custo unitario dos itens nao pode ser negativo.");
	}

	if (items.some((item) => !Number.isFinite(item.valorDesconto) || item.valorDesconto < 0 || item.valorDesconto > item.quantidade * item.valorUnitario)) {
		fail(formData, "O desconto de um item nao pode superar seu valor bruto.");
	}

	const valorProdutos = roundMoney(
		items.reduce(
			(total, item) => total + item.quantidade * item.valorUnitario - item.valorDesconto,
			0
		)
	);
	const valorTotal = roundMoney(valorProdutos + valorFrete + valorSeguro + outrasDespesas - valorDesconto);

	if (!Number.isFinite(valorTotal) || valorTotal <= 0 || valorProdutos <= 0) {
		fail(formData, "O total da compra deve ser maior que zero.");
	}

	if (valorDesconto > valorProdutos + valorFrete + valorSeguro + outrasDespesas) {
		fail(formData, "O desconto geral nao pode superar o valor da compra.");
	}

	const client = await db.connect();

	try {
		await client.query("begin");

		const fornecedor = await client.query(
			"select 1 from public.fornecedores where codfornecedor = $1 and ativo = 'S'",
			[codfornecedor]
		);
		const condicao = await client.query(
			"select * from public.condicoes_pagamento where codcondicao_pagamento = $1 and ativo = 'S'",
			[codcondicaoPagamento]
		);

		if (fornecedor.rowCount !== 1) {
			throw new Error("O fornecedor selecionado nao esta ativo.");
		}

		if (condicao.rowCount !== 1) {
			throw new Error("A condicao de pagamento selecionada nao esta ativa.");
		}

		const termsResult = await client.query<PaymentTerm>(
			`select num_parcela, dias_vencimento, percentual, codforma_pagamento
			from public.condicoes_pagamento_parcelas where codcondicao_pagamento = $1 order by num_parcela`, [codcondicaoPagamento]);
		const terms = termsResult.rows;
		if (!terms.length || terms.length !== Number(condicao.rows[0].parcelas) || Math.abs(terms.reduce((sum, term) => sum + Number(term.percentual), 0) - 100) > 0.0001) {
			throw new Error("Revise as parcelas da condição de pagamento: elas devem totalizar 100%.");
		}
		let dueDates: unknown;
		try { dueDates = JSON.parse(getText(formData, "vencimentos_json") || "[]"); }
		catch { throw new Error("Vencimentos inválidos."); }
		if (!Array.isArray(dueDates) || dueDates.length !== terms.length) throw new Error("Revise os vencimentos das parcelas.");
		const dates = dueDates.map((value, index) => {
			const date = value === null ? addDays(dataEmissao, Number(terms[index].dias_vencimento)) : String(value);
			if (!isIsoDate(date) || date < dataEmissao) throw new Error("O vencimento deve ser igual ou posterior à emissão.");
			return date;
		});
		const installmentValues = allocateMoney(valorTotal, terms.map((term) => Number(term.percentual)));
		if (installmentValues.some((value) => value <= 0)) throw new Error("O total da nota é insuficiente para gerar todas as parcelas.");
		const itemValues = items.map((item) => roundMoney(item.quantidade * item.valorUnitario - item.valorDesconto));
		const allocations = allocateMoney(roundMoney(valorTotal - valorProdutos), itemValues);

		const produtos = await client.query<{ codproduto: number }>(
			"select codproduto from public.produtos where codproduto = any($1::int[]) and ativo = 'S' order by codproduto for update",
			[productIds]
		);

		if (produtos.rowCount !== productIds.length) {
			throw new Error("Um ou mais produtos selecionados nao estao ativos.");
		}

		await client.query(
			`insert into public.compras (
				codfornecedor, codcondicao_pagamento, modelo, serie, numero_nota,
				data_emissao, data_chegada, valor_produtos, valor_frete, valor_seguro,
				outras_despesas, valor_desconto, valor_total, status, ativo, observacoes
			) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'CONFIRMADA', 'S', $14)`,
			[
				codfornecedor,
				codcondicaoPagamento,
				modelo,
				serie,
				numeroNota,
				dataEmissao,
				dataChegada,
				valorProdutos,
				valorFrete,
				valorSeguro,
				outrasDespesas,
				valorDesconto,
				valorTotal,
				observacoes || null,
			]
		);
		for (const [index, item] of items.entries()) {
			const itemTotal = roundMoney(item.quantidade * item.valorUnitario - item.valorDesconto);

			await client.query(
				`insert into public.compras_itens (
					modelo, serie, numero_nota, codfornecedor, num_item,
					codproduto, quantidade, valor_unitario, valor_desconto, valor_total, valor_rateio
				) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
				[
					modelo,
					serie,
					numeroNota,
					codfornecedor,
					index + 1,
					item.codproduto,
					item.quantidade,
					item.valorUnitario,
					item.valorDesconto,
					itemTotal,
					allocations[index],
				]
			);

			await client.query(
				`update public.produtos
				set quantidade_estoque = quantidade_estoque + $1, preco_custo = $2
				where codproduto = $3`,
				[item.quantidade, roundMoney((itemTotal + allocations[index]) / item.quantidade), item.codproduto]
			);
		}

		for (const [index, term] of terms.entries()) {
			const account = await client.query(`insert into public.contas_pagar
				(conta_pagar, codfornecedor, codforma_pagamento, numero_documento, data_emissao, data_vencimento, valor)
				values ($1, $2, $3, $4, $5, $6, $7) returning codconta_pagar`,
				[`Compra ${numeroNota} - parcela ${term.num_parcela}/${terms.length}`, codfornecedor, term.codforma_pagamento, numeroNota, dataEmissao, dates[index], installmentValues[index]]);
			await client.query(`insert into public.compras_parcelas
				(modelo, serie, numero_nota, codfornecedor, num_parcela, percentual, codconta_pagar)
				values ($1, $2, $3, $4, $5, $6, $7)`,
				[modelo, serie, numeroNota, codfornecedor, term.num_parcela, term.percentual, account.rows[0].codconta_pagar]);
		}

		await client.query("commit");
	} catch (error) {
		await client.query("rollback");
		fail(formData, databaseMessage(error));
	} finally {
		client.release();
	}

	revalidatePath("/cadastro/contas-pagar");
	revalidatePath("/dashboard");
	revalidatePath(COMPRAS_PATH);
	revalidatePath("/cadastro/produtos-servicos/produtos");
	redirect(buildRedirect(COMPRAS_PATH, "success", "Compra cadastrada, estoque atualizado e contas a pagar geradas com sucesso."));
}

export async function cancelCompraAction(formData: FormData) {
	const modelo = getText(formData, "modelo");
	const serie = getText(formData, "serie");
	const numeroNota = getText(formData, "numero_nota");
	const codfornecedor = Number(getText(formData, "codfornecedor"));

	if (
		modelo.length < 1 || modelo.length > 10 ||
		serie.length < 1 || serie.length > 10 ||
		numeroNota.length < 1 || numeroNota.length > 30 ||
		!Number.isInteger(codfornecedor) || codfornecedor <= 0
	) {
		fail(formData, "Compra invalida para cancelamento.");
	}
	const motivo = getText(formData, "motivo_cancelamento");
	if (!motivo || motivo.length > 500) fail(formData, "Informe o motivo do cancelamento (até 500 caracteres).");

	const compraKey = [modelo, serie, numeroNota, codfornecedor];

	const client = await db.connect();

	try {
		await client.query("begin");

		const compraResult = await client.query<{ status: string }>(
			`select status
			from public.compras
			where modelo = $1 and serie = $2 and numero_nota = $3 and codfornecedor = $4
			for update`,
			compraKey
		);
		const compra = compraResult.rows[0];

		if (!compra) {
			throw new Error("Compra nao encontrada.");
		}

		if (compra.status === "CANCELADA") {
			throw new Error("Esta compra ja esta cancelada.");
		}

		const accounts = await client.query(`select cp.codconta_pagar, cp.valor_pago, cp.status
			from public.compras_parcelas p join public.contas_pagar cp using (codconta_pagar)
			where p.modelo = $1 and p.serie = $2 and p.numero_nota = $3 and p.codfornecedor = $4
			for update of cp`, compraKey);
		if (accounts.rows.some((account) => Number(account.valor_pago) > 0 || account.status === "PAGO")) {
			throw new Error("Estorne os pagamentos das parcelas antes de cancelar a compra.");
		}
		await client.query(`update public.contas_pagar set status = 'CANCELADO', ativo = 'N'
			where codconta_pagar = any($1::bigint[])`, [accounts.rows.map((account) => account.codconta_pagar)]);

		const itensResult = await client.query<{
			codproduto: number;
			quantidade: number;
			quantidade_estoque: number;
			produto: string;
		}>(
			`select ci.codproduto, ci.quantidade, p.quantidade_estoque, p.produto
			from public.compras_itens ci
			join public.produtos p on p.codproduto = ci.codproduto
			where ci.modelo = $1
				and ci.serie = $2
				and ci.numero_nota = $3
				and ci.codfornecedor = $4
			order by ci.codproduto
			for update of p`,
			compraKey
		);
		const itemSemEstoque = itensResult.rows.find(
			(item) => Number(item.quantidade_estoque) < Number(item.quantidade)
		);

		if (itemSemEstoque) {
			throw new Error(
				`Nao e possivel cancelar: o estoque de ${itemSemEstoque.produto} e menor que a quantidade recebida nesta compra.`
			);
		}

		for (const item of itensResult.rows) {
			await client.query(
				`update public.produtos
				set quantidade_estoque = quantidade_estoque - $1
				where codproduto = $2`,
				[item.quantidade, item.codproduto]
			);
		}

		await client.query(
			`update public.compras
			set status = 'CANCELADA', ativo = 'N', motivo_cancelamento = $5, data_cancelamento = current_timestamp
			where modelo = $1 and serie = $2 and numero_nota = $3 and codfornecedor = $4`,
			[...compraKey, motivo]
		);
		await client.query("commit");
	} catch (error) {
		await client.query("rollback");
		fail(formData, databaseMessage(error));
	} finally {
		client.release();
	}

	revalidatePath("/cadastro/contas-pagar");
	revalidatePath("/dashboard");
	revalidatePath(COMPRAS_PATH);
	revalidatePath("/cadastro/produtos-servicos/produtos");
	redirect(buildRedirect(COMPRAS_PATH, "success", "Compra cancelada e estoque revertido com sucesso."));
}
