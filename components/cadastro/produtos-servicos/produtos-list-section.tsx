import { listarProdutosComCategorias } from "@/lib/produtos-servicos";

function formatarMoeda(valor: number | string | null) {
	return `R$ ${Number(valor ?? 0).toFixed(2)}`;
}

export async function ProdutosListSection() {
	const { categorias, produtos, error } = await listarProdutosComCategorias();
	const categoriaMap = new Map(
		(categorias ?? []).map((categoria) => [categoria.codcategoria, categoria.nome])
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Produtos cadastrados</h2>
				<span className="text-sm text-neutral-500">{produtos?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar produtos: {error.message}</p>
			) : produtos && produtos.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Produto</th>
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Estoque</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Imagem</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{produtos.map((produto) => (
								<tr key={produto.codproduto} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{produto.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{produto.codcategoria ? categoriaMap.get(produto.codcategoria) ?? "-" : "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(produto.valor)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{produto.quantidade_estoque}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{formatarMoeda(produto.valor_desconto)}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{produto.imagem_url ? "Sim" : "Nao"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{produto.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum produto cadastrado no banco ainda.</p>
			)}
		</div>
	);
}
