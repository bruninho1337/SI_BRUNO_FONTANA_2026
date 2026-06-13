import { deleteContaPagarAction } from "@/app/cadastro/contas-pagar/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarContasPagar } from "@/lib/data/contas-pagar";

type ContasPagarListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatCurrency(value: number | string | null) {
	return Number(value ?? 0).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function formatDate(value: string | Date | null | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
	}).format(date);
}

function formatStatus(status: string) {
	const labels: Record<string, string> = {
		PENDENTE: "Pendente",
		PAGO: "Pago",
		CANCELADO: "Cancelado",
	};

	return labels[status] ?? status;
}

export async function ContasPagarListSection({
	searchParams,
}: ContasPagarListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: contas, error } = await listarContasPagar();
	const filtered = (contas ?? []).filter((conta) =>
		[
			conta.codconta_pagar,
			conta.conta_pagar,
			conta.fornecedor,
			conta.forma_pagamento,
			conta.numero_documento,
			conta.status,
			conta.ativo,
			conta.valor,
			conta.valor_pago,
		].some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Contas a pagar cadastradas"
				count={filtered.length}
				createHref="/cadastro/contas-pagar?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por conta a pagar, fornecedor, documento, status ou valor"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar contas a pagar: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Conta</th>
								<th className="pb-2 font-medium">Fornecedor</th>
								<th className="pb-2 font-medium">Vencimento</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Pago</th>
								<th className="pb-2 font-medium">Status</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 font-medium">Forma</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((conta) => (
								<tr key={conta.codconta_pagar} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">
										{conta.conta_pagar}
										{conta.numero_documento ? (
											<span className="block text-xs text-neutral-500">
												Doc: {conta.numero_documento}
											</span>
										) : null}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{conta.fornecedor}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDate(conta.data_vencimento)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{formatCurrency(conta.valor)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatCurrency(conta.valor_pago)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{formatStatus(conta.status)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{conta.ativo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{conta.forma_pagamento ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/contas-pagar?edit=${conta.codconta_pagar}`}
											deleteAction={deleteContaPagarAction}
											idName="codconta_pagar"
											idValue={conta.codconta_pagar}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma conta a pagar encontrada.</p>
			)}
		</div>
	);
}
