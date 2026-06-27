import { deleteUnidadeMedidaAction } from "@/app/cadastro/produtos-servicos/unidades-medida/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarUnidadesMedida } from "@/lib/data/unidades-medida";

type UnidadesMedidaListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function UnidadesMedidaListSection({
	searchParams,
}: UnidadesMedidaListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: unidades, error } = await listarUnidadesMedida();
	const filtered = (unidades ?? []).filter((unidade) =>
		[unidade.unidade_medida, unidade.sigla].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Unidades de medida cadastradas"
				count={filtered.length}
				createHref="/cadastro/produtos-servicos/unidades-medida?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por unidade ou sigla"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar unidades de medida: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Unidade</th>
								<th className="pb-2 font-medium">Sigla</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((unidade) => (
								<tr key={unidade.codunidade_medida} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">
										{unidade.unidade_medida}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{unidade.sigla}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{unidade.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/produtos-servicos/unidades-medida?edit=${unidade.codunidade_medida}`}
											deleteAction={deleteUnidadeMedidaAction}
											idName="codunidade_medida"
											idValue={unidade.codunidade_medida}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma unidade de medida encontrada.</p>
			)}
		</div>
	);
}
