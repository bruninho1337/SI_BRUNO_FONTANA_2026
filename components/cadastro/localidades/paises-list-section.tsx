import { listarPaises } from "@/lib/localidades";

export async function PaisesListSection() {
	const { data: paises, error } = await listarPaises();

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Países cadastrados</h2>
				<span className="text-sm text-neutral-500">{paises?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar países: {error.message}</p>
			) : paises && paises.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">País</th>
								<th className="pb-2 font-medium">Sigla</th>
								<th className="pb-2 font-medium">DDI</th>
								<th className="pb-2 font-medium">Moeda</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{paises.map((pais) => (
								<tr key={pais.codpais} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{pais.pais}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.sigla ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.ddi ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.moeda ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{pais.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum país cadastrado no banco ainda.</p>
			)}
		</div>
	);
}
