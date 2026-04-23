import { listarCategorias } from "@/lib/produtos-servicos";

export async function CategoriasListSection() {
	const { data: categorias, error } = await listarCategorias();

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Categorias cadastradas</h2>
				<span className="text-sm text-neutral-500">{categorias?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar categorias: {error.message}</p>
			) : categorias && categorias.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Descrição</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{categorias.map((categoria) => (
								<tr key={categoria.codcategoria} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{categoria.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.tipo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.descricao ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{categoria.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma categoria cadastrada no banco ainda.</p>
			)}
		</div>
	);
}
