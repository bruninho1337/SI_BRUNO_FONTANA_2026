import { deleteCidadeAction } from "@/app/cadastro/localidades/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarCidadesComEstados } from "@/lib/localidades";

type CidadesListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function CidadesListSection({ searchParams }: CidadesListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { estados, cidades, error } = await listarCidadesComEstados();
	const estadoMap = new Map(
		(estados ?? []).map((estado) => [estado.codestado, `${estado.estado} - ${estado.uf}`])
	);
	const filtered = (cidades ?? []).filter((cidade) =>
		[cidade.cidade, estadoMap.get(cidade.codest)].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Cidades cadastradas"
				count={filtered.length}
				createHref="/cadastro/localidades/cidades?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por cidade ou estado"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar cidades: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Cidade</th>
								<th className="pb-2 font-medium">Estado</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((cidade) => (
								<tr key={cidade.codcidade} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{cidade.cidade}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{estadoMap.get(cidade.codest) ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{cidade.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/localidades/cidades?edit=${cidade.codcidade}`}
											deleteAction={deleteCidadeAction}
											idName="codcidade"
											idValue={cidade.codcidade}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma cidade encontrada.</p>
			)}
		</div>
	);
}
