import { deleteCategoriaAction } from "@/app/cadastro/produtos-servicos/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarCategorias } from "@/lib/produtos-servicos";

type CategoriasListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function CategoriasListSection({ searchParams }: CategoriasListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: categorias, error } = await listarCategorias();
	const filtered = (categorias ?? []).filter((categoria) =>
		[categoria.nome, categoria.tipo, categoria.descricao].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Categorias cadastradas"
				count={filtered.length}
				createHref="/cadastro/produtos-servicos/categorias?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por categoria, tipo ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar categorias: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Descricao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((categoria) => (
								<tr key={categoria.codcategoria} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{categoria.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.tipo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.descricao ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{categoria.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/produtos-servicos/categorias?edit=${categoria.codcategoria}`}
											deleteAction={deleteCategoriaAction}
											idName="codcategoria"
											idValue={categoria.codcategoria}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma categoria encontrada.</p>
			)}
		</div>
	);
}
