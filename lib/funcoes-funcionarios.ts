import { queryMaybeSingle, queryRows } from "@/lib/db";

const FUNCAO_FUNCIONARIO_SELECT =
	"codfuncao_funcionario, funcao_funcionario, descricao, ativo, data_cadastro as data_criacao, data_ult_alteracao as data_atualizacao";

export async function listarFuncoesFuncionarios() {
	return queryRows(
		`select ${FUNCAO_FUNCIONARIO_SELECT} from public.funcoes_funcionarios order by funcao_funcionario asc`
	);
}

export async function listarFuncoesFuncionariosParaSelecao() {
	return queryRows(
		"select codfuncao_funcionario, funcao_funcionario from public.funcoes_funcionarios where ativo = 'S' order by funcao_funcionario asc"
	);
}

export async function buscarFuncaoFuncionarioPorId(codfuncaoFuncionario: number) {
	return queryMaybeSingle(
		`select ${FUNCAO_FUNCIONARIO_SELECT} from public.funcoes_funcionarios where codfuncao_funcionario = $1`,
		[codfuncaoFuncionario]
	);
}
