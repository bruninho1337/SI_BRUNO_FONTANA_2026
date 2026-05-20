import { queryMaybeSingle, queryRows } from "@/lib/db";

export async function listarCondicoesPagamento() {
	return queryRows(
		"select codcondicao_pagamento, nome, prazo_dias, parcelas, juro, multa, desconto, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.condicoes_pagamento order by nome asc"
	);
}

export async function listarCondicoesPagamentoParaSelecao() {
	return queryRows(
		"select codcondicao_pagamento, nome, prazo_dias, parcelas from public.condicoes_pagamento where ativo = 'S' order by nome asc"
	);
}

export async function buscarCondicaoPagamentoPorId(codcondicaoPagamento: number) {
	return queryMaybeSingle(
		"select codcondicao_pagamento, nome, prazo_dias, parcelas, juro, multa, desconto, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao from public.condicoes_pagamento where codcondicao_pagamento = $1",
		[codcondicaoPagamento]
	);
}
