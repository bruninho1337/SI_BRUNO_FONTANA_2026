import { queryMaybeSingle, queryRows } from "@/lib/database/db";

const FORNECEDOR_SELECT =
	"codfornecedor, tipo, fornecedor, nome_fantasia, contato, endereco, numero, complemento, bairro, cep, codcidade, telefone, email, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao";

export async function listarFornecedoresComCidades() {
	const [{ data: cidades }, { data: fornecedores, error }] = await Promise.all([
		queryRows("select codcidade, cidade from public.cidades order by cidade asc"),
		queryRows(
			`select ${FORNECEDOR_SELECT} from public.fornecedores order by codfornecedor desc`
		),
	]);

	return { cidades, fornecedores, error };
}

export async function listarFornecedoresParaSelecao() {
	return queryRows(
		"select codfornecedor, fornecedor from public.fornecedores where ativo = 'S' order by fornecedor asc"
	);
}

export async function buscarFornecedorPorId(codfornecedor: number) {
	return queryMaybeSingle(
		`select ${FORNECEDOR_SELECT} from public.fornecedores where codfornecedor = $1`,
		[codfornecedor]
	);
}
