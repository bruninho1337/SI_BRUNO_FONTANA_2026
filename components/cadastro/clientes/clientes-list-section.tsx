import { listarClientesComCidades } from "@/lib/clientes";

function formatDate(value: string | null) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export async function ClientesListSection() {
	const { cidades, clientes, error } = await listarClientesComCidades();
	const cidadeMap = new Map((cidades ?? []).map((cidade) => [cidade.codcidade, cidade.cidade]));

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Clientes cadastrados</h2>
				<span className="text-sm text-neutral-500">{clientes?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar clientes: {error.message}</p>
			) : clientes && clientes.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Codigo</th>
								<th className="pb-2 font-medium">Cliente</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Cidade</th>
								<th className="pb-2 font-medium">Telefone</th>
								<th className="pb-2 font-medium">E-mail</th>
								<th className="pb-2 font-medium">Criacao</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{clientes.map((cliente) => (
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
									<td className="px-4 py-3 text-sm text-neutral-700">
										{cidadeMap.get(cliente.codcidade) ?? "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cliente.telefone}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cliente.email}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{formatDate(cliente.data_criacao)}
									</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">
										{cliente.ativo}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum cliente cadastrado no banco ainda.</p>
			)}
		</div>
	);
}
