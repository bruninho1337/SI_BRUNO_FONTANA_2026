import { CompraForm, type PurchaseInitial } from "@/components/cadastro/compras/compra-form";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { buscarCompraPorId, carregarOpcoesCompra } from "@/lib/data/compras";

type CompraFormSectionProps = { searchParams?: Promise<{ success?: string; error?: string; edit?: string }> };

function dateValue(value: unknown) {
	if (!value) return "";
	if (typeof value === "string") return value.slice(0, 10);
	const date = new Date(value as Date);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function moneyValue(value: unknown) {
	return Number(value ?? 0).toFixed(2).replace(".", ",");
}

export async function CompraFormSection({ searchParams }: CompraFormSectionProps) {
	const params = await searchParams;
	const editRequested = Boolean(params?.edit);
	const editId = Number(params?.edit ?? "");
	const [options, purchaseResult] = await Promise.all([
		carregarOpcoesCompra(),
		editRequested && Number.isInteger(editId) && editId > 0
			? buscarCompraPorId(editId)
			: Promise.resolve({ compra: null, itens: null, error: null }),
	]);
	const { fornecedores, condicoesPagamento, produtos, error: optionsError } = options;
	const { compra, itens, error: purchaseError } = purchaseResult;

	if (editRequested && (!compra || purchaseError)) {
		return (
			<div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-neutral-900">Compra não encontrada</h2>
				<p className="mt-2 text-sm text-red-600">{purchaseError?.message ?? "O registro informado não existe."}</p>
			</div>
		);
	}

	const fornecedorOptions = (fornecedores ?? []).map((item) => ({
		id: String(item.codfornecedor),
		label: String(item.fornecedor),
		codcondicaoPagamento: item.codcondicao_pagamento ? String(item.codcondicao_pagamento) : "",
	}));
	const condicaoOptions = (condicoesPagamento ?? []).map((item) => ({
		id: String(item.codcondicao_pagamento),
		label: `${item.condicao_pagamento} · ${item.parcelas}x`,
	}));
	const produtoOptions = (produtos ?? []).map((item) => ({
		id: String(item.codproduto),
		label: String(item.produto),
		precoCusto: Number(item.preco_custo ?? 0),
		estoque: Number(item.quantidade_estoque ?? 0),
		unidade: String(item.unidade_medida ?? "UN"),
	}));

	if (compra && !fornecedorOptions.some((item) => item.id === String(compra.codfornecedor))) {
		fornecedorOptions.unshift({ id: String(compra.codfornecedor), label: String(compra.fornecedor), codcondicaoPagamento: String(compra.codcondicao_pagamento) });
	}

	if (compra && !condicaoOptions.some((item) => item.id === String(compra.codcondicao_pagamento))) {
		condicaoOptions.unshift({ id: String(compra.codcondicao_pagamento), label: String(compra.condicao_pagamento) });
	}

	for (const item of itens ?? []) {
		if (!produtoOptions.some((option) => option.id === String(item.codproduto))) {
			produtoOptions.push({
				id: String(item.codproduto),
				label: String(item.produto),
				precoCusto: Number(item.valor_unitario ?? 0),
				estoque: Number(item.quantidade_estoque ?? 0),
				unidade: String(item.unidade_medida ?? "UN"),
			});
		}
	}

	const initialPurchase: PurchaseInitial | undefined = compra
		? {
				codcompra: String(compra.codcompra),
				codfornecedor: String(compra.codfornecedor),
				codcondicaoPagamento: String(compra.codcondicao_pagamento),
				modelo: String(compra.modelo),
				serie: String(compra.serie),
				numeroNota: String(compra.numero_nota),
				dataEmissao: dateValue(compra.data_emissao),
				dataChegada: dateValue(compra.data_chegada),
				valorFrete: moneyValue(compra.valor_frete),
				valorSeguro: moneyValue(compra.valor_seguro),
				outrasDespesas: moneyValue(compra.outras_despesas),
				valorDesconto: moneyValue(compra.valor_desconto),
				observacoes: String(compra.observacoes ?? ""),
				status: String(compra.status),
				itens: (itens ?? []).map((item) => ({
					id: `item-${item.num_item}`,
					codproduto: String(item.codproduto),
					quantidade: String(item.quantidade),
					valor_unitario: moneyValue(item.valor_unitario),
					valor_desconto: moneyValue(item.valor_desconto),
				})),
			}
		: undefined;

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
			<div className="mb-6 flex flex-col gap-3 border-b border-neutral-100 pb-5 md:flex-row md:items-start md:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Entrada de estoque</p>
					<h2 className="mt-2 text-xl font-semibold text-neutral-900">{compra ? `Compra #${compra.codcompra}` : "Nova Compra"}</h2>
					<p className="mt-1 text-sm text-neutral-500">{compra ? "Consulte os dados registrados. Compras confirmadas não podem ser alteradas." : "Informe a nota fiscal e adicione todos os produtos recebidos."}</p>
				</div>
				<span className={compra ? "w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700" : "w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"}>
					{compra ? "Somente leitura" : "Estoque atualizado ao salvar"}
				</span>
			</div>

			<FormFeedback params={params} />
			{optionsError ? (
				<p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					Erro ao carregar dados da compra: {optionsError.message}
				</p>
			) : null}

			<CompraForm
				fornecedores={fornecedorOptions}
				condicoesPagamento={condicaoOptions}
				produtos={produtoOptions}
				disabled={Boolean(optionsError)}
				initialPurchase={initialPurchase}
			/>
		</div>
	);
}
