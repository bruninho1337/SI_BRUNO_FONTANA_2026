import { deleteCondicaoPagamentoAction } from "@/app/cadastro/condicoes-pagamento/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarCondicoesPagamento } from "@/lib/condicoes-pagamento";

type CondicoesPagamentoListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatDecimal(value: number | string | null) {
	return Number(value ?? 0).toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export async function CondicoesPagamentoListSection({
	searchParams,
}: CondicoesPagamentoListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: condicoes, error } = await listarCondicoesPagamento();
	const filtered = (condicoes ?? []).filter((condicao) =>
		[
			condicao.nome,
			condicao.prazo_dias,
			condicao.parcelas,
			condicao.juro,
			condicao.multa,
			condicao.desconto,
		].some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Condicoes de pagamento cadastradas"
				count={filtered.length}
				createHref="/cadastro/condicoes-pagamento?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por condicao, prazo, parcelas, juro, multa ou desconto"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar condicoes: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Condicao</th>
								<th className="pb-2 font-medium">Prazo</th>
								<th className="pb-2 font-medium">Parcelas</th>
								<th className="pb-2 font-medium">Juro</th>
								<th className="pb-2 font-medium">Multa</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((condicao) => (
								<tr key={condicao.codcondicao_pagamento} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{condicao.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{condicao.prazo_dias} dia(s)</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{condicao.parcelas}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDecimal(condicao.juro)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDecimal(condicao.multa)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDecimal(condicao.desconto)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{condicao.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/condicoes-pagamento?edit=${condicao.codcondicao_pagamento}`}
											deleteAction={deleteCondicaoPagamentoAction}
											idName="codcondicao_pagamento"
											idValue={condicao.codcondicao_pagamento}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma condicao de pagamento encontrada.</p>
			)}
		</div>
	);
}
