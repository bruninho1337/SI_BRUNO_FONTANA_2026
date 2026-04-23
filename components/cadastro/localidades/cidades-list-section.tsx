import { listarCidadesComEstados } from "@/lib/localidades";

export async function CidadesListSection() {
	const { estados, cidades, error } = await listarCidadesComEstados();
	const estadoMap = new Map(
		(estados ?? []).map((estado) => [estado.codestado, `${estado.estado} - ${estado.uf}`])
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Cidades cadastradas</h2>
				<span className="text-sm text-neutral-500">{cidades?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar cidades: {error.message}</p>
			) : cidades && cidades.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Cidade</th>
								<th className="pb-2 font-medium">Estado</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{cidades.map((cidade) => (
								<tr key={cidade.codcidade} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{cidade.cidade}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{estadoMap.get(cidade.codest) ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{cidade.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma cidade cadastrada no banco ainda.</p>
			)}
		</div>
	);
}
