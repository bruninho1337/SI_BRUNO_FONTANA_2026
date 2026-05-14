import { deletePaisAction } from "@/app/cadastro/localidades/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarPaises } from "@/lib/localidades";

type PaisesListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function PaisesListSection({ searchParams }: PaisesListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: paises, error } = await listarPaises();
	const filtered = (paises ?? []).filter((pais) =>
		[pais.pais, pais.sigla, pais.ddi, pais.moeda].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Paises cadastrados"
				count={filtered.length}
				createHref="/cadastro/localidades/paises?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por pais, sigla, DDI ou moeda"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar paises: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Pais</th>
								<th className="pb-2 font-medium">Sigla</th>
								<th className="pb-2 font-medium">DDI</th>
								<th className="pb-2 font-medium">Moeda</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((pais) => (
								<tr key={pais.codpais} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{pais.pais}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.sigla ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.ddi ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.moeda ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{pais.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/localidades/paises?edit=${pais.codpais}`}
											deleteAction={deletePaisAction}
											idName="codpais"
											idValue={pais.codpais}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum pais encontrado.</p>
			)}
		</div>
	);
}
