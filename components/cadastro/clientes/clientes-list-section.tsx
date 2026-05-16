import { deleteClienteAction } from "@/app/cadastro/clientes/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarClientesComCidades } from "@/lib/clientes";

type ClientesListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatDate(value: string | null) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export async function ClientesListSection({ searchParams }: ClientesListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { cidades, condicoesPagamento, clientes, error } = await listarClientesComCidades();
	const cidadeMap = new Map((cidades ?? []).map((cidade) => [cidade.codcidade, cidade.cidade]));
	const condicaoPagamentoMap = new Map(
		(condicoesPagamento ?? []).map((condicao) => [condicao.codcondicao_pagamento, condicao.nome])
	);
	const filtered = (clientes ?? []).filter((cliente) =>
		[
			cliente.codcliente,
			cliente.cliente,
			cliente.apelido,
			cliente.tipo,
			cidadeMap.get(cliente.codcidade),
			condicaoPagamentoMap.get(cliente.codcondicao_pagamento),
			cliente.telefone,
			cliente.email,
			cliente.cpf_cnpj,
		].some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Clientes cadastrados"
				count={filtered.length}
				createHref="/cadastro/clientes?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por cliente, cidade, telefone, e-mail ou documento"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar clientes: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Codigo</th>
								<th className="pb-2 font-medium">Cliente</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Cidade</th>
								<th className="pb-2 font-medium">Condicao</th>
								<th className="pb-2 font-medium">Telefone</th>
								<th className="pb-2 font-medium">E-mail</th>
								<th className="pb-2 font-medium">Criacao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((cliente) => (
								<tr key={cliente.codcliente} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">
										{cliente.codcliente}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-900">
										{cliente.cliente}
										{cliente.apelido ? (
											<span className="block text-xs text-neutral-500">{cliente.apelido}</span>
										) : null}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cliente.tipo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cidadeMap.get(cliente.codcidade) ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{condicaoPagamentoMap.get(cliente.codcondicao_pagamento) ?? "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cliente.telefone}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cliente.email}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDate(cliente.data_criacao)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{cliente.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/clientes?edit=${cliente.codcliente}`}
											deleteAction={deleteClienteAction}
											idName="codcliente"
											idValue={cliente.codcliente}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum cliente encontrado.</p>
			)}
		</div>
	);
}
