import { queryMaybeSingle, queryRows } from "@/lib/database/db";

const FORMAS_PAGAMENTO_SELECT =
	"codforma_pagamento, forma_pagamento, tipo, descricao, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao";

export async function listarFormasPagamento() {
	return queryRows(
		`select ${FORMAS_PAGAMENTO_SELECT} from public.formas_pagamento order by forma_pagamento asc`
	);
}

export async function listarFormasPagamentoParaSelecao() {
	return queryRows(
		"select codforma_pagamento, forma_pagamento, tipo from public.formas_pagamento where ativo = 'S' order by forma_pagamento asc"
	);
}

export async function buscarFormaPagamentoPorId(codformaPagamento: number) {
	return queryMaybeSingle(
		`select ${FORMAS_PAGAMENTO_SELECT} from public.formas_pagamento where codforma_pagamento = $1`,
		[codformaPagamento]
	);
}
