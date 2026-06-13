import { queryMaybeSingle, queryRows } from "@/lib/database/db";

export type ParcelaCondicaoPagamento = {
	num_parcela: number;
	dias_vencimento: number;
	codforma_pagamento: number;
	percentual: number | string;
};

export async function listarCondicoesPagamento() {
	return queryRows(
		`select cp.codcondicao_pagamento, cp.condicao_pagamento, cp.codforma_pagamento, fp.forma_pagamento, fp.tipo,
			cp.prazo_dias, cp.parcelas, cp.juro, cp.multa, cp.desconto, cp.ativo,
			cp.data_cadastro as data_criacao, cp.data_ult_alteracao as data_atualizacao
		from public.condicoes_pagamento cp
		left join public.formas_pagamento fp on fp.codforma_pagamento = cp.codforma_pagamento
		order by cp.condicao_pagamento asc`
	);
}

export async function listarCondicoesPagamentoParaSelecao() {
	return queryRows(
		`select cp.codcondicao_pagamento, cp.condicao_pagamento, cp.codforma_pagamento, fp.forma_pagamento, fp.tipo,
			cp.prazo_dias, cp.parcelas
		from public.condicoes_pagamento cp
		left join public.formas_pagamento fp on fp.codforma_pagamento = cp.codforma_pagamento
		where cp.ativo = 'S'
		order by cp.condicao_pagamento asc`
	);
}

export async function buscarCondicaoPagamentoPorId(codcondicaoPagamento: number) {
	return queryMaybeSingle(
		`select codcondicao_pagamento, condicao_pagamento, codforma_pagamento, prazo_dias, parcelas, juro, multa,
			desconto, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao
		from public.condicoes_pagamento
		where codcondicao_pagamento = $1`,
		[codcondicaoPagamento]
	);
}

export async function listarParcelasCondicaoPagamento(codcondicaoPagamento: number) {
	return queryRows<ParcelaCondicaoPagamento>(
		`select num_parcela, dias_vencimento, codforma_pagamento, percentual
		from public.condicoes_pagamento_parcelas
		where codcondicao_pagamento = $1
		order by num_parcela asc`,
		[codcondicaoPagamento]
	);
}
