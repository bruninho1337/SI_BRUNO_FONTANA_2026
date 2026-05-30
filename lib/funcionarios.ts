import { queryMaybeSingle, queryRows } from "@/lib/db";

const FUNCIONARIO_SELECT =
	`
	f.codfuncionario,
	f.funcionario,
	f.apelido,
	f.codfuncao_funcionario,
	ff.funcao_funcionario,
	f.telefone,
	f.email,
	f.cpf,
	f.rg,
	f.data_nascimento,
	f.data_admissao,
	f.data_demissao,
	f.salario_base,
	f.percentual_comissao,
	f.observacoes,
	f.ativo,
	f.data_cadastro as data_criacao,
	f.data_ult_alteracao as data_atualizacao
`;

export async function listarFuncionarios() {
	return queryRows(
		`select ${FUNCIONARIO_SELECT}
		from public.funcionarios f
		join public.funcoes_funcionarios ff on ff.codfuncao_funcionario = f.codfuncao_funcionario
		order by f.funcionario asc`
	);
}

export async function buscarFuncionarioPorId(codfuncionario: number) {
	return queryMaybeSingle(
		`select ${FUNCIONARIO_SELECT}
		from public.funcionarios f
		join public.funcoes_funcionarios ff on ff.codfuncao_funcionario = f.codfuncao_funcionario
		where f.codfuncionario = $1`,
		[codfuncionario]
	);
}
