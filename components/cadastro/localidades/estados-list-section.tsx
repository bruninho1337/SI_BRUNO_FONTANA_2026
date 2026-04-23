import { listarEstadosComPaises } from "@/lib/localidades";

export async function EstadosListSection() {
	const { paises, estados, error } = await listarEstadosComPaises();
	const paisMap = new Map((paises ?? []).map((pais) => [pais.codpais, pais.pais]));

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Estados cadastrados</h2>
				<span className="text-sm text-neutral-500">{estados?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar estados: {error.message}</p>
			) : estados && estados.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">UF</th>
								<th className="pb-2 font-medium">Estado</th>
								<th className="pb-2 font-medium">País</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{estados.map((estado) => (
								<tr key={estado.codestado} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">{estado.uf}</td>
									<td className="px-4 py-3 text-sm text-neutral-900">{estado.estado}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{paisMap.get(estado.codpais) ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{estado.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum estado cadastrado no banco ainda.</p>
			)}
		</div>
	);
}
