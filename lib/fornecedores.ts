import { queryMaybeSingle, queryRows } from "@/lib/db";

const FORNECEDOR_SELECT =
	"codfornecedor, tipo, fornecedor, nome_fantasia, contato, endereco, numero, complemento, bairro, cep, codcidade, telefone, email, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo, data_criacao, data_atualizacao";

export async function listarFornecedoresComCidades() {
	const [{ data: cidades }, { data: fornecedores, error }] = await Promise.all([
		queryRows("select codcidade, cidade from public.cidades order by cidade asc"),
		queryRows(
			`select ${FORNECEDOR_SELECT} from public.fornecedores order by codfornecedor desc`
		),
	]);

	return { cidades, fornecedores, error };
}

export async function buscarFornecedorPorId(codfornecedor: number) {
	return queryMaybeSingle(
		`select ${FORNECEDOR_SELECT} from public.fornecedores where codfornecedor = $1`,
		[codfornecedor]
	);
}
