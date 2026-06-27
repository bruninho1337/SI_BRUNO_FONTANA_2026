import { queryMaybeSingle, queryRows } from "@/lib/database/db";

const MARCA_SELECT =
	"codmarca, marca, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao";

export async function listarMarcas() {
	return queryRows(`select ${MARCA_SELECT} from public.marcas order by marca asc`);
}

export async function listarMarcasParaSelecao() {
	return queryRows(
		"select codmarca, marca from public.marcas where ativo = 'S' order by marca asc"
	);
}

export async function buscarMarcaPorId(codmarca: number) {
	return queryMaybeSingle(
		`select ${MARCA_SELECT} from public.marcas where codmarca = $1`,
		[codmarca]
	);
}
