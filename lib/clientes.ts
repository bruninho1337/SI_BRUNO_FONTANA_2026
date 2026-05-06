import { createClient } from "@/lib/supabase/server";

export async function listarClientesComCidades() {
	const supabase = await createClient();

	const [{ data: cidades }, { data: clientes, error }] = await Promise.all([
		supabase.from("cidades").select("codcidade, cidade"),
		supabase
			.from("clientes")
			.select(
				"codcliente, tipo, cliente, apelido, codcidade, telefone, email, ativo, data_criacao, data_atualizacao"
			)
			.order("codcliente", { ascending: false }),
	]);

	return { cidades, clientes, error };
}
