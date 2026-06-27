import { queryMaybeSingle, queryRows } from "@/lib/database/db";

const UNIDADE_MEDIDA_SELECT =
	"codunidade_medida, unidade_medida, sigla, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao";

export async function listarUnidadesMedida() {
	return queryRows(
		`select ${UNIDADE_MEDIDA_SELECT} from public.unidades_medida order by unidade_medida asc`
	);
}

export async function listarUnidadesMedidaParaSelecao() {
	return queryRows(
		"select codunidade_medida, unidade_medida, sigla from public.unidades_medida where ativo = 'S' order by unidade_medida asc"
	);
}

export async function buscarUnidadeMedidaPorId(codunidadeMedida: number) {
	return queryMaybeSingle(
		`select ${UNIDADE_MEDIDA_SELECT} from public.unidades_medida where codunidade_medida = $1`,
		[codunidadeMedida]
	);
}
