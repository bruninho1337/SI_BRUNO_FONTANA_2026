import { createClient } from "@/lib/supabase/server";

export async function listarClientesComCidades() {
	const supabase = await createClient();

	const [{ data: cidades }, { data: condicoesPagamento }, { data: clientes, error }] = await Promise.all([
		supabase.from("cidades").select("codcidade, cidade"),
		supabase.from("condicoes_pagamento").select("codcondicao_pagamento, nome"),
		supabase
			.from("clientes")
			.select(
				"codcliente, tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade, data_nascimento, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo, data_criacao, data_atualizacao"
			)
			.order("codcliente", { ascending: false }),
	]);

	return { cidades, condicoesPagamento, clientes, error };
}

export async function buscarClientePorId(codcliente: number) {
	const supabase = await createClient();

	return supabase
		.from("clientes")
		.select(
			"codcliente, tipo, cliente, apelido, estado_civil, endereco, numero, complemento, bairro, cep, codcidade, codcondicao_pagamento, telefone, email, sexo, nacionalidade, data_nascimento, rg_inscricao_estadual, cpf_cnpj, observacoes, ativo"
		)
		.eq("codcliente", codcliente)
		.maybeSingle();
}
