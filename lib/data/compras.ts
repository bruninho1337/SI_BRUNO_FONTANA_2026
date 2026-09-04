import { queryMaybeSingle, queryRows } from "@/lib/database/db";

export async function listarCompras() {
	return queryRows(
		`select c.codcompra, c.modelo, c.serie, c.numero_nota, c.data_emissao, c.data_chegada,
			c.valor_produtos, c.valor_frete, c.valor_seguro, c.outras_despesas,
			c.valor_desconto, c.valor_total, c.status, c.ativo,
			c.data_cadastro as data_criacao, c.data_ult_alteracao as data_atualizacao,
			f.fornecedor, cp.condicao_pagamento, count(ci.num_item)::int as quantidade_itens
		from public.compras c
		join public.fornecedores f on f.codfornecedor = c.codfornecedor
		join public.condicoes_pagamento cp on cp.codcondicao_pagamento = c.codcondicao_pagamento
		left join public.compras_itens ci on ci.codcompra = c.codcompra
		group by c.codcompra, f.fornecedor, cp.condicao_pagamento
		order by c.data_emissao desc, c.codcompra desc`
	);
}

export async function carregarOpcoesCompra() {
	const [fornecedoresResult, condicoesResult, produtosResult] = await Promise.all([
		queryRows(
			`select codfornecedor, fornecedor, codcondicao_pagamento
			from public.fornecedores
			where ativo = 'S'
			order by fornecedor asc`
		),
		queryRows(
			`select codcondicao_pagamento, condicao_pagamento, parcelas, prazo_dias
			from public.condicoes_pagamento
			where ativo = 'S'
			order by condicao_pagamento asc`
		),
		queryRows(
			`select p.codproduto, p.produto, p.preco_custo, p.quantidade_estoque,
				u.sigla as unidade_medida
			from public.produtos p
			left join public.unidades_medida u on u.codunidade_medida = p.codunidade_medida
			where p.ativo = 'S'
			order by p.produto asc`
		),
	]);

	return {
		fornecedores: fornecedoresResult.data,
		condicoesPagamento: condicoesResult.data,
		produtos: produtosResult.data,
		error:
			fornecedoresResult.error ??
			condicoesResult.error ??
			produtosResult.error,
	};
}

export async function buscarCompraPorId(codcompra: number) {
	const [compraResult, itensResult] = await Promise.all([
		queryMaybeSingle(
			`select c.codcompra, c.codfornecedor, c.codcondicao_pagamento, c.modelo, c.serie,
				c.numero_nota, c.data_emissao, c.data_chegada, c.valor_produtos,
				c.valor_frete, c.valor_seguro, c.outras_despesas, c.valor_desconto,
				c.valor_total, c.status, c.observacoes, c.ativo,
				c.data_cadastro as data_criacao, c.data_ult_alteracao as data_atualizacao,
				f.fornecedor, cp.condicao_pagamento
			from public.compras c
			join public.fornecedores f on f.codfornecedor = c.codfornecedor
			join public.condicoes_pagamento cp on cp.codcondicao_pagamento = c.codcondicao_pagamento
			where c.codcompra = $1`,
			[codcompra]
		),
		queryRows(
			`select ci.num_item, ci.codproduto, ci.quantidade, ci.valor_unitario,
				ci.valor_desconto, ci.valor_total, p.produto,
				p.quantidade_estoque, u.sigla as unidade_medida
			from public.compras_itens ci
			join public.produtos p on p.codproduto = ci.codproduto
			left join public.unidades_medida u on u.codunidade_medida = p.codunidade_medida
			where ci.codcompra = $1
			order by ci.num_item asc`,
			[codcompra]
		),
	]);

	return {
		compra: compraResult.data,
		itens: itensResult.data,
		error: compraResult.error ?? itensResult.error,
	};
}
