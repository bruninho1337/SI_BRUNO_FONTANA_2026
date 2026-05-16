import { queryMaybeSingle, queryRows } from "@/lib/db";

export async function listarClientesComCidades() {
	const [{ data: cidades }, { data: condicoesPagamento }, { data: clientes, error }] = await Promise.all([
		queryRows("select codcidade, cidade from public.cidades order by cidade asc"),
		queryRows("select codcondicao_pagamento, nome from public.condicoes_pagamento order by nome asc"),
		queryRows(
			"select codcliente, tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade, data_nascimento, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo, data_criacao, data_atualizacao from public.clientes order by codcliente desc"
		),
	]);

	return { cidades, condicoesPagamento, clientes, error };
}

export async function buscarClientePorId(codcliente: number) {
	return queryMaybeSingle(
		"select codcliente, tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade, data_nascimento, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo from public.clientes where codcliente = $1",
		[codcliente]
	);
}
