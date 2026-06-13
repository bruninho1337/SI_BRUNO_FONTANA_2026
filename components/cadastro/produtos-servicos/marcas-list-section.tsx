import { deleteMarcaAction } from "@/app/cadastro/produtos-servicos/marcas/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarMarcas } from "@/lib/data/marcas";

type MarcasListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function MarcasListSection({ searchParams }: MarcasListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: marcas, error } = await listarMarcas();
	const filtered = (marcas ?? []).filter((marca) =>
		[marca.marca, marca.descricao].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Marcas cadastradas"
				count={filtered.length}
				createHref="/cadastro/produtos-servicos/marcas?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por marca ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar marcas: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Marca</th>
								<th className="pb-2 font-medium">Descricao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((marca) => (
								<tr key={marca.codmarca} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{marca.marca}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{marca.descricao ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{marca.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/produtos-servicos/marcas?edit=${marca.codmarca}`}
											deleteAction={deleteMarcaAction}
											idName="codmarca"
											idValue={marca.codmarca}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma marca encontrada.</p>
			)}
		</div>
	);
}
