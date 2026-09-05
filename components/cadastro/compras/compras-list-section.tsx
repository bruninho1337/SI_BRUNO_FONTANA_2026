import Link from "next/link";
import { Edit } from "lucide-react";

import { CadastroListToolbar } from "@/components/cadastro/cadastro-list-actions";
import { CancelCompraForm } from "@/components/cadastro/compras/cancel-compra-form";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { listarCompras } from "@/lib/data/compras";

type ComprasListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatCurrency(value: number | string | null) {
	return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | Date | null | undefined) {
	if (!value) return "-";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" }).format(date);
}

function buildEditHref(compra: { modelo: unknown; serie: unknown; numero_nota: unknown; codfornecedor: unknown }) {
	const params = new URLSearchParams({
		edit: "1",
		modelo: String(compra.modelo),
		serie: String(compra.serie),
		numero_nota: String(compra.numero_nota),
		codfornecedor: String(compra.codfornecedor),
	});

	return `/cadastro/compras?${params.toString()}`;
}

export async function ComprasListSection({ searchParams }: ComprasListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: compras, error } = await listarCompras();
	const filtered = (compras ?? []).filter((compra) =>
		[compra.fornecedor, compra.modelo, compra.serie, compra.numero_nota, compra.condicao_pagamento, compra.status]
			.some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar title="Compras cadastradas" count={filtered.length} createHref="/cadastro/compras?mode=create" searchValue={params?.q} searchPlaceholder="Pesquisar por fornecedor, nota, modelo, série ou condição" />
			<FormFeedback params={params} />
			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar compras: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead><tr className="text-left text-sm text-neutral-500">
							<th className="pb-2 font-medium">Nota</th><th className="pb-2 font-medium">Fornecedor</th><th className="pb-2 font-medium">Emissão</th><th className="pb-2 font-medium">Chegada</th><th className="pb-2 font-medium">Itens</th><th className="pb-2 font-medium">Condição</th><th className="pb-2 font-medium">Total</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Ações</th>
						</tr></thead>
						<tbody>{filtered.map((compra) => (
							<tr key={`${compra.modelo}:${compra.serie}:${compra.numero_nota}:${compra.codfornecedor}`} className="bg-neutral-50">
								<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">{compra.numero_nota}<span className="block text-xs font-normal text-neutral-500">Mod. {compra.modelo} · Série {compra.serie}</span></td>
								<td className="px-4 py-3 text-sm text-neutral-700">{compra.fornecedor}</td><td className="px-4 py-3 text-sm text-neutral-700">{formatDate(compra.data_emissao)}</td><td className="px-4 py-3 text-sm text-neutral-700">{formatDate(compra.data_chegada)}</td><td className="px-4 py-3 text-sm text-neutral-700">{compra.quantidade_itens}</td><td className="px-4 py-3 text-sm text-neutral-700">{compra.condicao_pagamento}</td><td className="px-4 py-3 text-sm font-semibold text-neutral-900">{formatCurrency(compra.valor_total)}</td>
								<td className="px-4 py-3"><span className={compra.status === "CONFIRMADA" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600"}>{compra.status === "CONFIRMADA" ? "Confirmada" : "Cancelada"}</span></td>
								<td className="rounded-r-xl px-4 py-3">
									<div className="flex items-center justify-end gap-2">
										<Button asChild variant="outline" size="icon" className="rounded-xl border-neutral-300" title="Visualizar compra">
											<Link href={buildEditHref(compra)} aria-label="Visualizar compra">
												<Edit className="h-4 w-4" aria-hidden="true" />
											</Link>
										</Button>
										<CancelCompraForm
											modelo={String(compra.modelo)}
											serie={String(compra.serie)}
											numeroNota={String(compra.numero_nota)}
											codfornecedor={String(compra.codfornecedor)}
											disabled={compra.status === "CANCELADA"}
										/>
									</div>
								</td>
							</tr>
						))}</tbody>
					</table>
				</div>
			) : (
				<div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10 text-center">
					<p className="text-sm font-medium text-neutral-700">Nenhuma compra cadastrada.</p><p className="mt-1 text-sm text-neutral-500">Use o botão Novo para registrar a primeira entrada.</p>
				</div>
			)}
		</div>
	);
}
