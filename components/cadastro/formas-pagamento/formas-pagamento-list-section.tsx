import { deleteFormaPagamentoAction } from "@/app/cadastro/formas-pagamento/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarFormasPagamento } from "@/lib/data/formas-pagamento";

type FormasPagamentoListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

const tipoLabels: Record<string, string> = {
	DINHEIRO: "Dinheiro",
	PIX: "PIX",
	CARTAO_CREDITO: "Cartão de Crédito",
	CARTAO_DEBITO: "Cartão de Débito",
	BOLETO: "Boleto",
	TRANSFERENCIA: "Transferência",
	OUTROS: "Outros",
};

export async function FormasPagamentoListSection({
	searchParams,
}: FormasPagamentoListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: formasPagamento, error } = await listarFormasPagamento();
	const filtered = (formasPagamento ?? []).filter((forma) =>
		[forma.forma_pagamento, tipoLabels[String(forma.tipo)] ?? forma.tipo, forma.descricao].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Formas de pagamento cadastradas"
				count={filtered.length}
				createHref="/cadastro/formas-pagamento?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por forma de pagamento, tipo ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar formas de pagamento: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Forma de Pagamento</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Descricao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((forma) => (
								<tr key={forma.codforma_pagamento} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{forma.forma_pagamento}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">
										{tipoLabels[String(forma.tipo)] ?? forma.tipo}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{forma.descricao ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{forma.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/formas-pagamento?edit=${forma.codforma_pagamento}`}
											deleteAction={deleteFormaPagamentoAction}
											idName="codforma_pagamento"
											idValue={forma.codforma_pagamento}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma forma de pagamento encontrada.</p>
			)}
		</div>
	);
}
