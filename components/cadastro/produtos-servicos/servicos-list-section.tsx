import { listarServicosComCategorias } from "@/lib/produtos-servicos";

function formatarMoeda(valor: number | string | null) {
	return `R$ ${Number(valor ?? 0).toFixed(2)}`;
}

export async function ServicosListSection() {
	const { categorias, servicos, error } = await listarServicosComCategorias();
	const categoriaMap = new Map(
		(categorias ?? []).map((categoria) => [categoria.codcategoria, categoria.nome])
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Serviços cadastrados</h2>
				<span className="text-sm text-neutral-500">{servicos?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar serviços: {error.message}</p>
			) : servicos && servicos.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Serviço</th>
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Duração</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Imagem</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{servicos.map((servico) => (
								<tr key={servico.codservico} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{servico.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{servico.codcategoria ? categoriaMap.get(servico.codcategoria) ?? "-" : "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.duracao_minutos} min</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(servico.valor)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{formatarMoeda(servico.valor_desconto)}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.imagem_url ? "Sim" : "Nao"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{servico.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum serviço cadastrado no banco ainda.</p>
			)}
		</div>
	);
}
