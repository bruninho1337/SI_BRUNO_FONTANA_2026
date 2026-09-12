"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

import { createCompraAction, validateCompraKeyAction } from "@/app/cadastro/compras/actions";
import { ParcelasLayout, ParcelaRow } from "@/components/cadastro/condicoes-pagamento/parcelas-layout";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { DatePickerInput } from "@/components/forms/date-picker-input";
import { FormStatePersistence } from "@/components/forms/form-state-persistence";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";

import { addDays, allocateMoney, isIsoDate, purchaseToday, roundMoney, type PaymentTerm } from "@/lib/compras-calculos";

type SupplierOption = { id: string; label: string; codcondicaoPagamento: string };
type Option = { id: string; label: string };
type ProductOption = Option & { precoCusto: number; estoque: number; unidade: string };
type PurchaseItem = {
	id: string;
	codproduto: string;
	quantidade: string;
	valor_unitario: string;
	valor_desconto: string;
	valorRateio?: number;
};
export type PurchaseInitial = {
	codfornecedor: string;
	codcondicaoPagamento: string;
	modelo: string;
	serie: string;
	numeroNota: string;
	dataEmissao: string;
	dataChegada: string;
	valorFrete: string;
	valorSeguro: string;
	outrasDespesas: string;
	valorDesconto: string;
	observacoes: string;
	status: string;
	motivoCancelamento: string;
	parcelas: { num_parcela: number; percentual: number; dataVencimento: string; valor: number; forma_pagamento: string; status: string }[];
	dataCriacao: string;
	dataAtualizacao: string;
	itens: PurchaseItem[];
};
type CompraFormProps = {
	fornecedores: SupplierOption[];
	condicoesPagamento: (Option & { parcelas: PaymentTerm[] })[];
	produtos: ProductOption[];
	disabled?: boolean;
	initialPurchase?: PurchaseInitial;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 disabled:opacity-100";
const fieldClass = "flex flex-col gap-2";

function parseDecimal(value: string) {
	const result = Number(value.trim().replace(/\./g, "").replace(",", "."));
	return Number.isFinite(result) ? result : 0;
}

function decimalText(value: number) {
	return value.toFixed(2).replace(".", ",");
}

function currency(value: number) {
	return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function newItem(index: number, id = `item-${Date.now()}-${index}`): PurchaseItem {
	return {
		id,
		codproduto: "",
		quantidade: "1",
		valor_unitario: "0,00",
		valor_desconto: "0,00",
	};
}

function normalizeMoneyInput(value: string) {
	return value.replace(/[^\d,.]/g, "").slice(0, 18);
}

export function CompraForm({ fornecedores, condicoesPagamento, produtos, disabled = false, initialPurchase }: CompraFormProps) {
	const readOnly = Boolean(initialPurchase);
	const [fornecedorId, setFornecedorId] = useState(initialPurchase?.codfornecedor ?? "");
	const [condicaoId, setCondicaoId] = useState(initialPurchase?.codcondicaoPagamento ?? "");
	const [modelo, setModelo] = useState(initialPurchase?.modelo ?? "");
	const [serie, setSerie] = useState(initialPurchase?.serie ?? "");
	const [numeroNota, setNumeroNota] = useState(initialPurchase?.numeroNota ?? "");
	const [dataEmissao, setDataEmissao] = useState(initialPurchase?.dataEmissao ?? purchaseToday());
	const [dataChegada, setDataChegada] = useState(initialPurchase?.dataChegada ?? purchaseToday());
	const [step, setStep] = useState<"key" | "dates" | "products" | "payment">("key");
	const [stepError, setStepError] = useState("");
	const [dueDates, setDueDates] = useState<Record<string, string>>({});
	const [validatedKey, setValidatedKey] = useState("");
	const [validating, setValidating] = useState(false);
	const [keyMessage, setKeyMessage] = useState("");
	const requestId = useRef(0);
	const formRef = useRef<HTMLFormElement>(null);
	const previousStep = useRef(step);
	useEffect(() => {
		if (previousStep.current === step) return;
		previousStep.current = step;
		const selector = { key: '[name="codfornecedor_display"]', dates: '#data_emissao', products: '[data-purchase-step="products"] button[id$="-trigger"]', payment: '#codcondicao_pagamento-trigger' }[step];
		formRef.current?.querySelector<HTMLElement>(selector)?.focus();
	}, [step]);
	const key = JSON.stringify([fornecedorId, modelo.trim(), serie.trim(), numeroNota.trim()]);
	const keyDisabled = readOnly || disabled || step !== "key" || validating;
	const datesDisabled = readOnly || disabled || step !== "dates" || validatedKey !== key;
	const productsDisabled = readOnly || disabled || step !== "products" || validatedKey !== key;
	const paymentDisabled = readOnly || disabled || step !== "payment" || validatedKey !== key;
	function invalidateKey() {
		requestId.current++;
		setValidating(false);
		setValidatedKey("");
		setStep("key");
		setStepError("");
		setKeyMessage("");
	}
	async function validateKey() {
		if (keyDisabled || !fornecedorId || !modelo.trim() || !serie.trim() || !numeroNota.trim()) return;
		const request = ++requestId.current;
		setValidating(true);
		setKeyMessage("");
		try {
			const result = await validateCompraKeyAction({ codfornecedor: fornecedorId, modelo, serie, numeroNota });
			if (request !== requestId.current) return;
			setValidatedKey(result.valid ? key : "");
			setKeyMessage(result.valid ? "Chave validada e bloqueada. Confira as datas para continuar." : result.message);
			if (result.valid) setStep("dates");
		} catch { if (request === requestId.current) setKeyMessage("Falha ao validar a nota. Tente novamente."); }
		finally { if (request === requestId.current) setValidating(false); }
	}
	const [items, setItems] = useState<PurchaseItem[]>(initialPurchase?.itens ?? [newItem(0, "item-0")]);
	const [valorFrete, setValorFrete] = useState(initialPurchase?.valorFrete ?? "0,00");
	const [valorSeguro, setValorSeguro] = useState(initialPurchase?.valorSeguro ?? "0,00");
	const [outrasDespesas, setOutrasDespesas] = useState(initialPurchase?.outrasDespesas ?? "0,00");
	const [valorDesconto, setValorDesconto] = useState(initialPurchase?.valorDesconto ?? "0,00");

	function restoreDraft(draft: Record<string, string | string[]>) {
			const detail = Object.fromEntries(Object.entries(draft).map(([name, value]) => [name, Array.isArray(value) ? value[0] : value]));
			const rawItems = detail?.itens_json;

			if (rawItems) {
				try {
					const restored = JSON.parse(rawItems) as PurchaseItem[];
					if (Array.isArray(restored) && restored.length > 0) {
						setItems(restored.map((item, index) => ({ ...item, id: item.id || `restored-${index}` })));
					}
				} catch {
					// Mantem o item inicial quando o rascunho antigo nao e valido.
				}
			}

			setModelo(detail?.modelo ?? "");
			setSerie(detail?.serie ?? "");
			setNumeroNota(detail?.numero_nota ?? "");
			setFornecedorId(detail?.codfornecedor ?? "");
			setCondicaoId(detail?.codcondicao_pagamento ?? "");
			setDataEmissao(detail?.data_emissao ?? purchaseToday());
			setDataChegada(detail?.data_chegada ?? purchaseToday());
			invalidateKey();
			try { setDueDates(JSON.parse(detail?.vencimentos_rascunho ?? "{}")); } catch { setDueDates({}); }
			setValorFrete(detail?.valor_frete ?? "0,00");
			setValorSeguro(detail?.valor_seguro ?? "0,00");
			setOutrasDespesas(detail?.outras_despesas ?? "0,00");
			setValorDesconto(detail?.valor_desconto ?? "0,00");
	}

	const totals = useMemo(() => {
		const produtosTotal = items.reduce((total, item) => {
			const quantidade = Number(item.quantidade) || 0;
			return roundMoney(total + Math.max(0, quantidade * roundMoney(parseDecimal(item.valor_unitario)) - roundMoney(parseDecimal(item.valor_desconto))));
		}, 0);
		const total = produtosTotal + roundMoney(parseDecimal(valorFrete)) + roundMoney(parseDecimal(valorSeguro)) + roundMoney(parseDecimal(outrasDespesas)) - roundMoney(parseDecimal(valorDesconto));
		return { produtos: produtosTotal, total: Math.max(0, roundMoney(total)) };
	}, [items, outrasDespesas, valorDesconto, valorFrete, valorSeguro]);

	function updateItem(id: string, field: keyof Omit<PurchaseItem, "id">, value: string) {
		setItems((current) => current.map((item) => {
			if (item.id !== id) return item;
			if (field === "codproduto") {
				const product = produtos.find((option) => option.id === value);
				return { ...item, codproduto: value, valor_unitario: decimalText(product?.precoCusto ?? 0) };
			}
			return { ...item, [field]: value };
		}));
	}

	function selectSupplier(value: string) {
		setFornecedorId(value);
		const defaultCondition = fornecedores.find((option) => option.id === value)?.codcondicaoPagamento;
		setCondicaoId(defaultCondition ?? "");
		invalidateKey();
	}

	function validateDates() {
		if (datesDisabled) return;
		if (!isIsoDate(dataEmissao) || dataEmissao > purchaseToday()) {
			setStepError("A emissão deve ser uma data válida, igual ou anterior a hoje.");
			return;
		}
		if (!isIsoDate(dataChegada) || dataChegada < dataEmissao) {
			setStepError("A chegada deve ser uma data válida, igual ou posterior à emissão.");
			return;
		}
		setStepError("");
		setStep("products");
	}

	function validateProducts() {
		if (productsDisabled) return;
		const validMoney = (value: string) => /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value.trim()) && Number.isFinite(parseDecimal(value));
		let error = "";
		if (!items.length || items.some((item) => !produtos.some((product) => product.id === item.codproduto))) {
			error = "Selecione um produto válido em todos os itens.";
		} else if (new Set(items.map((item) => item.codproduto)).size !== items.length) {
			error = "Cada produto deve aparecer apenas uma vez.";
		} else if (items.some((item) => !Number.isSafeInteger(Number(item.quantidade)) || Number(item.quantidade) <= 0)) {
			error = "Informe quantidades inteiras maiores que zero.";
		} else if (items.some((item) => !validMoney(item.valor_unitario) || !validMoney(item.valor_desconto))) {
			error = "Informe custos e descontos válidos, com até duas casas decimais.";
		} else if (items.some((item) => parseDecimal(item.valor_desconto) > Number(item.quantidade) * parseDecimal(item.valor_unitario))) {
			error = "O desconto de um item não pode superar seu valor bruto.";
		} else if ([valorFrete, valorSeguro, outrasDespesas, valorDesconto].some((value) => !validMoney(value))) {
			error = "Informe frete, seguro, despesas e desconto geral válidos, com até duas casas decimais.";
		} else if (totals.produtos <= 0 || totals.total <= 0 || !Number.isFinite(totals.total)) {
			error = "O total dos produtos e o total da nota devem ser maiores que zero. Confira os descontos.";
		}
		setStepError(error);
		if (!error) setStep("payment");
	}

	const terms = condicoesPagamento.find((option) => option.id === condicaoId)?.parcelas ?? [];
	const installmentValues = allocateMoney(totals.total, terms.map((term) => term.percentual));
	const installments = readOnly ? initialPurchase!.parcelas : terms.map((term, index) => ({
		...term, dataVencimento: dueDates[`${condicaoId}:${dataEmissao}:${term.num_parcela}`] ?? addDays(dataEmissao, term.dias_vencimento),
		valor: installmentValues[index], status: "PREVISTA",
	}));
	const allocations = allocateMoney(roundMoney(totals.total - totals.produtos), items.map((item) => Math.max(0, roundMoney(Number(item.quantidade) * roundMoney(parseDecimal(item.valor_unitario)) - roundMoney(parseDecimal(item.valor_desconto))))));

	const moneyFields = [
		{ name: "valor_frete", label: "Frete", value: valorFrete, setter: setValorFrete },
		{ name: "valor_seguro", label: "Seguro", value: valorSeguro, setter: setValorSeguro },
		{ name: "outras_despesas", label: "Outras despesas", value: outrasDespesas, setter: setOutrasDespesas },
		{ name: "valor_desconto", label: "Desconto geral", value: valorDesconto, setter: setValorDesconto },
	];

	return (
		<form ref={formRef} action={readOnly ? undefined : createCompraAction} className="space-y-5" onSubmit={(event) => { if (!readOnly && paymentDisabled) event.preventDefault(); }} onKeyDown={(event) => {
			if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement) || step === "payment") return;
			event.preventDefault();
			if (event.target.id === "numero_nota") void validateKey();
			if (event.target.id === "data_chegada") validateDates();
			if (event.target.id === "valor_desconto") validateProducts();
		}}>
			{readOnly ? null : <FormStatePersistence formKey="compras" onRestore={restoreDraft} />}
			{readOnly ? null : <><input type="hidden" name="vencimentos_json" value={JSON.stringify(installments.map((p) => p.dataVencimento))} /><input type="hidden" name="vencimentos_rascunho" value={JSON.stringify(dueDates)} /></>}
			{readOnly ? null : <input type="hidden" name="itens_json" value={JSON.stringify(items)} readOnly />}

			{!readOnly && Object.entries({ codfornecedor: fornecedorId, modelo, serie, numero_nota: numeroNota,
				data_emissao: dataEmissao, data_chegada: dataChegada, valor_frete: valorFrete, valor_seguro: valorSeguro,
				outras_despesas: outrasDespesas, valor_desconto: valorDesconto,
			}).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
			{!readOnly && <p role="status" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-800">{
				{ key: "Etapa 1 de 4: chave da nota", dates: "Etapa 2 de 4: datas", products: "Etapa 3 de 4: produtos e despesas", payment: "Etapa 4 de 4: pagamento e observações" }[step]
			}</p>}

			<div data-purchase-step="key" className="grid gap-4 md:grid-cols-12">
					<SearchableSelect name="codfornecedor_display" label="Fornecedor" searchLabel="Pesquisar fornecedor" searchPlaceholder="Digite o nome do fornecedor" selectPlaceholder="Selecione um fornecedor" options={fornecedores} required={!readOnly} disabled={keyDisabled} value={fornecedorId} onValueChange={selectSupplier} className="md:col-span-6" createHref={keyDisabled ? undefined : "/cadastro/fornecedores?mode=create"} createLabel="Novo fornecedor" />
					{readOnly ? (
						<div className={`${fieldClass} w-fit md:col-span-2 md:col-start-11 md:justify-self-end`}>
							<Label className="text-sm text-neutral-800">Status:</Label>
							<div
								role="status"
								className={`flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium ${
									initialPurchase?.status === "CONFIRMADA"
										? "border-neutral-900 bg-neutral-900 text-white"
										: "border-red-200 bg-red-50 text-red-700"
								}`}
							>
								{initialPurchase?.status === "CONFIRMADA" ? "Confirmada" : "Cancelada"}
							</div>
						</div>
					) : null}

					<div className={`${fieldClass} md:col-span-2 md:col-start-1`}>
						<RequiredLabel htmlFor="modelo" className="text-sm text-neutral-800">Modelo:</RequiredLabel>
						<Input id="modelo" name="modelo_display" maxLength={10} required={!readOnly} disabled={keyDisabled} value={modelo} onChange={(event) => { setModelo(event.target.value); invalidateKey(); }} placeholder="55" className={inputClass} />
					</div>
					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="serie" className="text-sm text-neutral-800">Série:</RequiredLabel>
						<Input id="serie" name="serie_display" maxLength={10} required={!readOnly} disabled={keyDisabled} value={serie} onChange={(event) => { setSerie(event.target.value); invalidateKey(); }} placeholder="1" className={inputClass} />
					</div>
					<div className={`${fieldClass} md:col-span-4`}>
						<RequiredLabel htmlFor="numero_nota" className="text-sm text-neutral-800">Número da nota:</RequiredLabel>
						<Input id="numero_nota" name="numero_nota_display" maxLength={30} required={!readOnly} disabled={keyDisabled} value={numeroNota} onBlur={(event) => {
							if (event.relatedTarget instanceof Element && event.relatedTarget.closest('[data-purchase-step="key"]')) return;
							void validateKey();
						}} onChange={(event) => { setNumeroNota(event.target.value); invalidateKey(); }} placeholder="Ex: 000012345" className={inputClass} />
					</div>
			</div>
			{!readOnly && step === "key" && <div className="space-y-2">
				<p role="status" className="text-sm text-neutral-600">{validating ? "Validando a nota..." : keyMessage || "Ao sair do número da nota ou pressionar Enter, a chave será validada automaticamente."}</p>
			</div>}
			<fieldset data-purchase-step="dates" disabled={datesDisabled} className="min-w-0 space-y-5" onBlur={(event) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				if (event.target.closest('[data-date-field="data_chegada"]')) validateDates();
			}}>
			<div className="grid gap-4 md:grid-cols-12">
					<DatePickerInput
						id="data_emissao"
						name="data_emissao_display"
						label="Emissão"
						max={purchaseToday()}
						value={dataEmissao} onChange={setDataEmissao}
						required={!readOnly}
						disabled={datesDisabled}
						className={`${fieldClass} md:col-span-3 md:col-start-1`}
						inputClassName={inputClass}
					/>
					<DatePickerInput
						id="data_chegada"
						name="data_chegada_display"
						label="Chegada"
						min={dataEmissao}
						value={dataChegada} onChange={setDataChegada}
						required={!readOnly}
						disabled={datesDisabled}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>
			</div>

			</fieldset>
			{!readOnly && step === "dates" && <div className="space-y-2">
				<p className="text-sm text-neutral-600">{keyMessage}</p>
				<p className="text-sm text-neutral-600">Ao sair da data de chegada ou pressionar Enter, as datas serão validadas automaticamente.</p>
				{stepError && <p role="alert" className="text-sm text-red-700">{stepError}</p>}
			</div>}
			<fieldset data-purchase-step="products" disabled={productsDisabled} className="min-w-0 space-y-5" onBlur={(event) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				if (event.target.id === "valor_desconto") validateProducts();
			}}>

			<div className="pt-3">
				<div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div><h3 className="font-semibold text-neutral-900">Itens da compra</h3><p className="mt-1 text-sm text-neutral-500">Ao menos um produto é obrigatório.</p></div>
					{readOnly ? null : (
						<Button type="button" variant="outline" onClick={() => setItems((current) => [...current, newItem(current.length)])} className="h-10 rounded-xl border-neutral-300">
							<Plus className="h-4 w-4" aria-hidden="true" />Adicionar item
						</Button>
					)}
				</div>

				<div className="space-y-3">
					{items.map((item, index) => {
						const subtotal = Math.max(0, roundMoney((Number(item.quantidade) || 0) * roundMoney(parseDecimal(item.valor_unitario)) - roundMoney(parseDecimal(item.valor_desconto))));
						const allocation = readOnly ? item.valorRateio : allocations[index];

						return (
							<div key={item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
								<div className="grid gap-4 md:grid-cols-12">
									<div className={`${fieldClass} md:col-span-1`}>
										<Label htmlFor={`item-numero-${item.id}`} className="text-sm font-medium text-neutral-800">Item:</Label>
										<Input id={`item-numero-${item.id}`} value={index + 1} readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600" />
									</div>
									<SearchableSelect
										id={`produto-${item.id}`}
										name={`produto_item_${index}`}
										label="Produto"
										searchLabel="Pesquisar produto"
										searchPlaceholder="Digite o nome do produto"
										selectPlaceholder="Selecione um produto"
										options={produtos
											.filter((product) => product.id === item.codproduto || !items.some((other) => other.id !== item.id && other.codproduto === product.id))
											.map((product) => ({
												id: product.id,
												label: `${product.label} · estoque ${product.estoque} ${product.unidade}`,
											}))}
										required={!readOnly}
										disabled={productsDisabled}
										value={item.codproduto}
										onValueChange={(value) => updateItem(item.id, "codproduto", value)}
										className="md:col-span-5"
										createHref={productsDisabled ? undefined : "/cadastro/produtos-servicos/produtos?mode=create"}
										createLabel="Novo produto"
									/>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`quantidade-${item.id}`} className="text-sm text-neutral-800">Quantidade:</RequiredLabel>
										<Input id={`quantidade-${item.id}`} type="number" min={1} step={1} required={!readOnly} disabled={productsDisabled} value={item.quantidade} onChange={(event) => updateItem(item.id, "quantidade", event.target.value)} className={inputClass} />
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`unitario-${item.id}`} className="text-sm text-neutral-800">Custo unitário:</RequiredLabel>
										<Input id={`unitario-${item.id}`} inputMode="decimal" required={!readOnly} disabled={productsDisabled} value={item.valor_unitario} onChange={(event) => updateItem(item.id, "valor_unitario", normalizeMoneyInput(event.target.value))} className={inputClass} />
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<Label htmlFor={`desconto-${item.id}`} className="text-sm text-neutral-800">Desconto:</Label>
										<Input id={`desconto-${item.id}`} inputMode="decimal" disabled={productsDisabled} value={item.valor_desconto} onChange={(event) => updateItem(item.id, "valor_desconto", normalizeMoneyInput(event.target.value))} className={inputClass} />
									</div>
								</div>
								{allocation !== undefined && <p className="mt-3 text-sm text-neutral-600">Participação: {totals.produtos > 0 ? (subtotal / totals.produtos * 100).toFixed(2).replace(".", ",") : "0,00"}% · Rateio: {currency(allocation)} · Custo com rateio: {currency(subtotal + allocation)}</p>}
								<div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
									<div className={`${fieldClass} w-full sm:w-48`}>
										<Label className="text-sm text-neutral-800">Subtotal:</Label>
										<div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900">{currency(subtotal)}</div>
									</div>
									<div className={fieldClass}>
										<Label className="text-sm font-medium text-neutral-800">Ações:</Label>
										<Button type="button" variant="outline" size="icon" disabled={productsDisabled || items.length === 1} onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} className="h-11 w-11 rounded-xl text-red-600" title="Remover item" aria-label={`Remover item ${index + 1}`}>
											<Trash2 className="h-4 w-4" aria-hidden="true" />
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<p className="text-right text-lg font-semibold">Total dos produtos: {currency(totals.produtos)}</p>
			<div className="grid gap-4 pt-3 md:grid-cols-12">
				{moneyFields.map((field) => (
					<div key={field.name} className={`${fieldClass} md:col-span-3`}>
						<Label htmlFor={field.name} className="text-sm text-neutral-800">{field.label}:</Label>
						<Input id={field.name} name={`${field.name}_display`} inputMode="decimal" disabled={productsDisabled} value={field.value} onChange={(event) => field.setter(normalizeMoneyInput(event.target.value))} className={inputClass} />
					</div>
				))}
			</div>

			</fieldset>
			{!readOnly && step === "products" && <div className="space-y-2">
				<p className="text-sm text-neutral-600">Confira os produtos e as despesas. Ao sair do desconto geral ou pressionar Enter, o pagamento será liberado se os dados estiverem válidos.</p>
				{stepError && <p role="alert" className="text-sm text-red-700">{stepError}</p>}
			</div>}
			<fieldset disabled={paymentDisabled} className="min-w-0 space-y-5">

			<div className="grid gap-4 md:grid-cols-12">
				<SearchableSelect name="codcondicao_pagamento" label="Condição de pagamento" searchLabel="Pesquisar condição" searchPlaceholder="Digite a condição de pagamento" selectPlaceholder="Selecione a condição" options={condicoesPagamento} required={!readOnly} disabled={paymentDisabled} value={condicaoId} onValueChange={setCondicaoId} className="md:col-span-5" createHref={paymentDisabled ? undefined : "/cadastro/condicoes-pagamento?mode=create"} createLabel="Nova condição" />
				<div className="md:col-span-7 md:text-right">
					<p className="text-sm text-neutral-500">Valor total da nota</p>
					<p className="mt-1 text-2xl font-bold text-neutral-900">{currency(totals.total)}</p>
				</div>
			</div>

			<ParcelasLayout
				title="Parcelas da condição de pagamento"
				description="Vencimentos calculados a partir da emissão da nota."
			>
				{installments.length ? installments.map((parcela) => {
					const prefix = `compra-parcela-${parcela.num_parcela}`;
					const days = dataEmissao && parcela.dataVencimento
						? Math.round((new Date(`${parcela.dataVencimento}T12:00:00Z`).getTime() - new Date(`${dataEmissao}T12:00:00Z`).getTime()) / 86_400_000)
						: null;
					const fields = [
						{ id: "numero", label: "Parcela", value: parcela.num_parcela, span: "md:col-span-2" },
						{ id: "dias", label: "Dias para vencimento", value: days !== null && Number.isFinite(days) ? days : "", span: "md:col-span-3" },
						{ id: "forma", label: "Forma de Pagamento", value: parcela.forma_pagamento, span: "md:col-span-5" },
						{ id: "percentual", label: "Percentual", value: `${parcela.percentual.toLocaleString("pt-BR")}%`, span: "md:col-span-2" },
						{ id: "valor", label: "Valor", value: currency(parcela.valor), span: "md:col-span-3" },
					];

					return <ParcelaRow key={parcela.num_parcela}>
						{fields.map((field) => <div key={field.id} className={`flex min-w-0 flex-col gap-2 ${field.span}`}>
							<Label htmlFor={`${prefix}-${field.id}`} className="text-sm font-medium text-neutral-800">{field.label}:</Label>
							<Input id={`${prefix}-${field.id}`} value={field.value} readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600 disabled:opacity-100" />
						</div>)}
						<DatePickerInput
							id={`${prefix}-vencimento`}
							name={`${prefix}-vencimento`}
							label="Vencimento"
							required={!readOnly}
							min={dataEmissao}
							disabled={paymentDisabled}
							value={parcela.dataVencimento}
							onChange={(value) => setDueDates((current) => ({ ...current, [`${condicaoId}:${dataEmissao}:${parcela.num_parcela}`]: value }))}
							className="flex min-w-0 flex-col gap-2 md:col-span-5"
							inputClassName={inputClass}
						/>
						<div className="flex min-w-0 flex-col gap-2 md:col-span-4">
							<Label htmlFor={`${prefix}-status`} className="text-sm font-medium text-neutral-800">Status:</Label>
							<Input id={`${prefix}-status`} value={parcela.status} readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600 disabled:opacity-100" />
						</div>
					</ParcelaRow>;
				}) : <p className="text-sm text-amber-700">{readOnly ? "Nenhuma parcela vinculada a esta compra." : "Selecione uma condição com parcelas cadastradas."}</p>}
			</ParcelasLayout>

			<div className="flex flex-col gap-2">
				<Label htmlFor="observacoes" className="text-sm text-neutral-800">Observações:</Label>
				<textarea id="observacoes" name="observacoes" maxLength={255} rows={4} disabled={paymentDisabled} defaultValue={initialPurchase?.observacoes} placeholder="Informações adicionais da nota ou do recebimento" className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600" />
			</div>

			<div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
					<span>{items.length} item(ns)</span>
					<span>Produtos: {currency(totals.produtos)}</span>
					<span>Acréscimos: {currency(parseDecimal(valorFrete) + parseDecimal(valorSeguro) + parseDecimal(outrasDespesas))}</span>
					<span>Desconto: {currency(parseDecimal(valorDesconto))}</span>
				</div>
			</div>

			</fieldset>
			{initialPurchase?.motivoCancelamento && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Motivo do cancelamento: {initialPurchase.motivoCancelamento}</p>}

			{readOnly ? (
				<AuditDates
					createdAt={initialPurchase?.dataCriacao}
					updatedAt={initialPurchase?.dataAtualizacao}
				/>
			) : null}

			{readOnly ? (
				<Button asChild variant="outline" className="h-11 w-full rounded-xl border-neutral-300"><Link href="/cadastro/compras">Voltar</Link></Button>
			) : (
				<Button type="submit" disabled={paymentDisabled || installments.length === 0 || fornecedores.length === 0 || condicoesPagamento.length === 0 || produtos.length === 0} className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar compra</Button>
			)}
		</form>
	);
}
