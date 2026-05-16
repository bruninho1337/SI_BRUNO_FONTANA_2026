import { createClient } from "@/lib/supabase/server";

export async function listarCondicoesPagamento() {
	const supabase = await createClient();

	return supabase
		.from("condicoes_pagamento")
		.select("codcondicao_pagamento, nome, prazo_dias, parcelas, juro, multa, desconto, ativo")
		.order("nome", { ascending: true });
}

export async function listarCondicoesPagamentoParaSelecao() {
	const supabase = await createClient();

	return supabase
		.from("condicoes_pagamento")
		.select("codcondicao_pagamento, nome, prazo_dias, parcelas")
		.eq("ativo", "S")
		.order("nome", { ascending: true });
}

export async function buscarCondicaoPagamentoPorId(codcondicaoPagamento: number) {
	const supabase = await createClient();

	return supabase
		.from("condicoes_pagamento")
		.select("codcondicao_pagamento, nome, prazo_dias, parcelas, juro, multa, desconto, ativo")
		.eq("codcondicao_pagamento", codcondicaoPagamento)
		.maybeSingle();
}
