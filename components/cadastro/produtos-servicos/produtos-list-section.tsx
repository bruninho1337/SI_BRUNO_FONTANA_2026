import { deleteProdutoAction } from "@/app/cadastro/produtos-servicos/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarProdutosComCategorias } from "@/lib/produtos-servicos";

type ProdutosListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatarMoeda(valor: number | string | null) {
	return `R$ ${Number(valor ?? 0).toFixed(2)}`;
}

export async function ProdutosListSection({ searchParams }: ProdutosListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { categorias, produtos, error } = await listarProdutosComCategorias();
	const categoriaMap = new Map(
		(categorias ?? []).map((categoria) => [categoria.codcategoria, categoria.nome])
	);
	const filtered = (produtos ?? []).filter((produto) =>
		[produto.nome, produto.descricao, categoriaMap.get(produto.codcategoria ?? 0)].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Produtos cadastrados"
				count={filtered.length}
				createHref="/cadastro/produtos-servicos/produtos?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por produto, categoria ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar produtos: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Produto</th>
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Estoque</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((produto) => (
								<tr key={produto.codproduto} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{produto.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{produto.codcategoria ? categoriaMap.get(produto.codcategoria) ?? "-" : "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(produto.valor)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{produto.quantidade_estoque}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(produto.valor_desconto)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{produto.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/produtos-servicos/produtos?edit=${produto.codproduto}`}
											deleteAction={deleteProdutoAction}
											idName="codproduto"
											idValue={produto.codproduto}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum produto encontrado.</p>
			)}
		</div>
	);
}
