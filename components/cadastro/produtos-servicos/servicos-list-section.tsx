import { deleteServicoAction } from "@/app/cadastro/produtos-servicos/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarServicosComCategorias } from "@/lib/produtos-servicos";

type ServicosListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatarMoeda(valor: number | string | null) {
	return `R$ ${Number(valor ?? 0).toFixed(2)}`;
}

export async function ServicosListSection({ searchParams }: ServicosListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { categorias, servicos, error } = await listarServicosComCategorias();
	const categoriaMap = new Map(
		(categorias ?? []).map((categoria) => [categoria.codcategoria, categoria.nome])
	);
	const filtered = (servicos ?? []).filter((servico) =>
		[servico.nome, servico.descricao, categoriaMap.get(servico.codcategoria ?? 0)].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Servicos cadastrados"
				count={filtered.length}
				createHref="/cadastro/produtos-servicos/servicos?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por servico, categoria ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar servicos: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Servico</th>
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Duracao</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((servico) => (
								<tr key={servico.codservico} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{servico.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{servico.codcategoria ? categoriaMap.get(servico.codcategoria) ?? "-" : "-"}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.duracao_minutos} min</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(servico.valor)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatarMoeda(servico.valor_desconto)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{servico.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/produtos-servicos/servicos?edit=${servico.codservico}`}
											deleteAction={deleteServicoAction}
											idName="codservico"
											idValue={servico.codservico}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum servico encontrado.</p>
			)}
		</div>
	);
}
