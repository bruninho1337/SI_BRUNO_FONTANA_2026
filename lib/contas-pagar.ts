import { queryMaybeSingle, queryRows } from "@/lib/db";

const CONTAS_PAGAR_SELECT = `
	cp.codconta_pagar,
	cp.conta_pagar,
	cp.codfornecedor,
	cp.codforma_pagamento,
	cp.numero_documento,
	cp.data_emissao,
	cp.data_vencimento,
	cp.data_pagamento,
	cp.valor,
	cp.valor_pago,
	cp.status,
	cp.ativo,
	cp.observacoes,
	cp.data_cadastro as data_criacao,
	cp.data_ult_alteracao as data_atualizacao,
	f.fornecedor,
	fp.forma_pagamento
`;

export async function listarContasPagar() {
	return queryRows(
		`select ${CONTAS_PAGAR_SELECT}
		from public.contas_pagar cp
		join public.fornecedores f on f.codfornecedor = cp.codfornecedor
		left join public.formas_pagamento fp on fp.codforma_pagamento = cp.codforma_pagamento
		order by cp.data_vencimento asc, cp.codconta_pagar desc`
	);
}

export async function buscarContaPagarPorId(codcontaPagar: number) {
	return queryMaybeSingle(
		`select ${CONTAS_PAGAR_SELECT}
		from public.contas_pagar cp
		join public.fornecedores f on f.codfornecedor = cp.codfornecedor
		left join public.formas_pagamento fp on fp.codforma_pagamento = cp.codforma_pagamento
		where cp.codconta_pagar = $1`,
		[codcontaPagar]
	);
}
