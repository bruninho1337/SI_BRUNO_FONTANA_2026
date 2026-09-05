import { queryMaybeSingle, queryRows } from "@/lib/database/db";

export type CompraKey = {
	modelo: string;
	serie: string;
	numeroNota: string;
	codfornecedor: number;
};

export type CompraListRow = {
	[column: string]: unknown;
	modelo: string;
	serie: string;
	numero_nota: string;
	codfornecedor: number | string;
	fornecedor: string;
	condicao_pagamento: string;
	data_emissao: string | Date | null;
	data_chegada: string | Date | null;
	valor_total: number | string;
	quantidade_itens: number;
	status: string;
};

export async function listarCompras() {
	return queryRows<CompraListRow>(
		`select c.modelo, c.serie, c.numero_nota, c.codfornecedor, c.data_emissao, c.data_chegada,
			c.valor_produtos, c.valor_frete, c.valor_seguro, c.outras_despesas,
			c.valor_desconto, c.valor_total, c.status, c.ativo,
			c.data_cadastro as data_criacao, c.data_ult_alteracao as data_atualizacao,
			f.fornecedor, cp.condicao_pagamento,
			(select count(*)::int
				from public.compras_itens ci
				where ci.modelo = c.modelo
					and ci.serie = c.serie
					and ci.numero_nota = c.numero_nota
					and ci.codfornecedor = c.codfornecedor) as quantidade_itens
		from public.compras c
		join public.fornecedores f on f.codfornecedor = c.codfornecedor
		join public.condicoes_pagamento cp on cp.codcondicao_pagamento = c.codcondicao_pagamento
		order by c.data_emissao desc, c.modelo, c.serie, c.numero_nota, c.codfornecedor`
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

export async function buscarCompraPorChave(chave: CompraKey) {
	const values = [chave.modelo, chave.serie, chave.numeroNota, chave.codfornecedor];

	const [compraResult, itensResult] = await Promise.all([
		queryMaybeSingle(
			`select c.codfornecedor, c.codcondicao_pagamento, c.modelo, c.serie,
				c.numero_nota, c.data_emissao, c.data_chegada, c.valor_produtos,
				c.valor_frete, c.valor_seguro, c.outras_despesas, c.valor_desconto,
				c.valor_total, c.status, c.observacoes, c.ativo,
				c.data_cadastro as data_criacao, c.data_ult_alteracao as data_atualizacao,
				f.fornecedor, cp.condicao_pagamento
			from public.compras c
			join public.fornecedores f on f.codfornecedor = c.codfornecedor
			join public.condicoes_pagamento cp on cp.codcondicao_pagamento = c.codcondicao_pagamento
			where c.modelo = $1
				and c.serie = $2
				and c.numero_nota = $3
				and c.codfornecedor = $4`,
			values
		),
		queryRows(
			`select ci.num_item, ci.codproduto, ci.quantidade, ci.valor_unitario,
				ci.valor_desconto, ci.valor_total, p.produto,
				p.quantidade_estoque, u.sigla as unidade_medida
			from public.compras_itens ci
			join public.produtos p on p.codproduto = ci.codproduto
			left join public.unidades_medida u on u.codunidade_medida = p.codunidade_medida
			where ci.modelo = $1
				and ci.serie = $2
				and ci.numero_nota = $3
				and ci.codfornecedor = $4
			order by ci.num_item asc`,
			values
		),
	]);

	return {
		compra: compraResult.data,
		itens: itensResult.data,
		error: compraResult.error ?? itensResult.error,
	};
}
