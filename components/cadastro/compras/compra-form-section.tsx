import { CompraForm, type PurchaseInitial } from "@/components/cadastro/compras/compra-form";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { buscarCompraPorChave, carregarOpcoesCompra } from "@/lib/data/compras";

type CompraFormSectionProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		edit?: string;
		modelo?: string;
		serie?: string;
		numero_nota?: string;
		codfornecedor?: string;
	}>;
};

function dateValue(value: unknown) {
	if (!value) return "";
	if (typeof value === "string") return value.slice(0, 10);
	const date = new Date(value as Date);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function moneyValue(value: unknown) {
	return Number(value ?? 0).toFixed(2).replace(".", ",");
}

function dateTimeValue(value: unknown) {
	if (!value) return "";
	const date = new Date(value as string | number | Date);
	return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export async function CompraFormSection({ searchParams }: CompraFormSectionProps) {
	const params = await searchParams;
	const editRequested = Boolean(params?.edit);
	const editKey = {
		modelo: String(params?.modelo ?? "").trim(),
		serie: String(params?.serie ?? "").trim(),
		numeroNota: String(params?.numero_nota ?? "").trim(),
		codfornecedor: Number(params?.codfornecedor ?? ""),
	};
	const validEditKey =
		editKey.modelo.length >= 1 && editKey.modelo.length <= 10 &&
		editKey.serie.length >= 1 && editKey.serie.length <= 10 &&
		editKey.numeroNota.length >= 1 && editKey.numeroNota.length <= 30 &&
		Number.isInteger(editKey.codfornecedor) && editKey.codfornecedor > 0;
	const [options, purchaseResult] = await Promise.all([
		carregarOpcoesCompra(),
		editRequested && validEditKey
			? buscarCompraPorChave(editKey)
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
				dataCriacao: dateTimeValue(compra.data_criacao),
				dataAtualizacao: dateTimeValue(compra.data_atualizacao),
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
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">{compra ? `Compra · Nota ${compra.numero_nota}` : "Nova Compra"}</h2>
				<p className="mt-1 text-sm text-neutral-500">{compra ? "Consulte os dados registrados abaixo. Os campos ficam bloqueados após a confirmação." : "Preencha os dados da compra abaixo."}</p>
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
