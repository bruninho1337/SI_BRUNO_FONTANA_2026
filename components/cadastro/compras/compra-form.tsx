"use client";

import { Textarea } from "@/components/ui/textarea";
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
import { purchaseAverageCost } from "@/lib/compras-calculos";

import { addDays, allocateInstallments, allocatePurchaseCosts, isIsoDate, purchaseDiscountExceedsTotal, purchaseItemTotal, purchaseItemTotalWithUnitDiscount, purchaseUnitDiscountTotal, purchaseToday, roundMoney, sumMoney, validPaymentPercentages, type PaymentTerm } from "@/lib/compras-calculos";

import { canTypePurchaseMoney, canTypePurchaseQuantity, parsePurchaseQuantity, PURCHASE_MONEY_PATTERN, PURCHASE_QUANTITY_PATTERN, validPurchaseDigits, validPurchaseInteger, validPurchaseMoney, validPurchasePreciseCost, validPurchaseQuantity } from "@/lib/compras-validacao";

type SupplierOption = { id: string; label: string; codcondicaoPagamento: string };
type Option = { id: string; label: string };
type ProductOption = Option & { precoCusto: string; estoque: number; unidade: string };
type PurchaseItem = {
	id: string;
	codproduto: string;
	quantidade: string;
	valor_unitario: string;
	valor_unitario_preciso?: string;
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
	valorTotal: number;
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

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 disabled:opacity-100";
const fieldClass = "flex flex-col gap-2";

function parseDecimal(value: string) {
	const result = Number(value.trim().replace(/\./g, "").replace(",", "."));
	return Number.isFinite(result) ? result : 0;
}

function decimalText(value: number | string) {
	return roundMoney(value).toFixed(2).replace(".", ",");
}

function itemUnitValue(item: PurchaseItem) {
	return item.valor_unitario_preciso ?? parseDecimal(item.valor_unitario);
}

function itemTotal(item: PurchaseItem, readOnly = false) {
	const quantity = validPurchaseQuantity(item.quantidade) ? parsePurchaseQuantity(item.quantidade) : 0;
	const calculate = readOnly ? purchaseItemTotal : purchaseItemTotalWithUnitDiscount;
	return Math.max(0, calculate(quantity, itemUnitValue(item), parseDecimal(item.valor_desconto)));
}

function currency(value: number, maximumFractionDigits = 2) {
	return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits });
}

function newItem(index: number, id = `item-${Date.now()}-${index}`): PurchaseItem {
	return {
		id,
		codproduto: "",
		quantidade: "1,00",
		valor_unitario: "0,00",
		valor_desconto: "0,00",
	};
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
	const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
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
		const selector = { key: '#codfornecedor_display-trigger', dates: '#data_emissao', products: '[data-purchase-step="products"] button[id$="-trigger"]', payment: '#codcondicao_pagamento-trigger' }[step];
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
		if (keyDisabled) return;
		if (!validateFields(keyFields)) return;
		const request = ++requestId.current;
		setValidating(true);
		setKeyMessage("");
		try {
			const result = await validateCompraKeyAction({ codfornecedor: fornecedorId, modelo, serie, numeroNota });
			if (request !== requestId.current) return;
			setValidatedKey(result.valid ? key : "");
			setKeyMessage(result.valid ? "" : result.message);
			if (result.valid) setStep("dates");
		} catch { if (request === requestId.current) setKeyMessage("Falha ao validar a nota. Tente novamente."); }
		finally { if (request === requestId.current) setValidating(false); }
	}
	const [items, setItems] = useState<PurchaseItem[]>(initialPurchase?.itens ?? [newItem(0, "item-0")]);
	const [valorFrete, setValorFrete] = useState(initialPurchase?.valorFrete ?? "0,00");
	const [valorSeguro, setValorSeguro] = useState(initialPurchase?.valorSeguro ?? "0,00");
	const [outrasDespesas, setOutrasDespesas] = useState(initialPurchase?.outrasDespesas ?? "0,00");

	function restoreDraft(draft: Record<string, string | string[]>) {
			const detail = Object.fromEntries(Object.entries(draft).map(([name, value]) => [name, Array.isArray(value) ? value[0] : value]));
			const rawItems = detail?.itens_json;

			if (rawItems) {
				try {
					const restored = JSON.parse(rawItems) as PurchaseItem[];
					if (Array.isArray(restored) && restored.length > 0 && restored.every((item) => item && typeof item === "object" && typeof item.quantidade === "string" && typeof item.valor_unitario === "string" && typeof item.valor_desconto === "string")) {
						setItems(restored.map((item, index) => ({
							...item, id: item.id || `restored-${index}`,
							quantidade: validPurchaseQuantity(item.quantidade) ? decimalText(parsePurchaseQuantity(item.quantidade)) : "",
							valor_unitario: validPurchaseMoney(item.valor_unitario) ? item.valor_unitario : "",
							valor_desconto: detail.desconto_tipo === "UNITARIO" && validPurchaseMoney(item.valor_desconto) ? item.valor_desconto : "",
							valor_unitario_preciso: validPurchasePreciseCost(item.valor_unitario_preciso) ? item.valor_unitario_preciso : undefined,
						})));
					}
				} catch {
					// Mantem o item inicial quando o rascunho antigo nao e valido.
				}
			}

			setModelo(detail?.modelo ?? "");
			setSerie(detail?.serie ?? "");
			setNumeroNota(detail?.numero_nota ?? "");
			setFornecedorId(detail?.codfornecedor ?? "");
			setCondicaoId(detail?.codcondicao_pagamento || fornecedores.find((option) => option.id === detail?.codfornecedor)?.codcondicaoPagamento || "");
			setDataEmissao(detail?.data_emissao ?? purchaseToday());
			setDataChegada(detail?.data_chegada ?? purchaseToday());
			invalidateKey();
			setTouchedFields({});
			try { setDueDates(JSON.parse(detail?.vencimentos_rascunho ?? "{}")); } catch { setDueDates({}); }
			setValorFrete(detail?.valor_frete ?? "0,00");
			setValorSeguro(detail?.valor_seguro ?? "0,00");
			setOutrasDespesas(detail?.outras_despesas ?? "0,00");
	}

	const totals = useMemo(() => {
		const produtosTotal = sumMoney(items.map((item) => itemTotal(item, readOnly)));
		const total = initialPurchase?.valorTotal ?? sumMoney([produtosTotal, parseDecimal(valorFrete), parseDecimal(valorSeguro), parseDecimal(outrasDespesas)]);
		return { produtos: produtosTotal, total: Math.max(0, roundMoney(total)) };
	}, [items, outrasDespesas, valorFrete, valorSeguro, initialPurchase?.valorTotal, readOnly]);

	function updateItem(id: string, field: keyof Omit<PurchaseItem, "id">, value: string) {
		setItems((current) => current.map((item) => {
			if (item.id !== id) return item;
			if (field === "codproduto") {
				const product = produtos.find((option) => option.id === value);
				return { ...item, codproduto: value, valor_unitario: decimalText(product?.precoCusto ?? 0), valor_unitario_preciso: product?.precoCusto ?? "0" };
			}
			if (field === "valor_unitario") return { ...item, valor_unitario: value, valor_unitario_preciso: undefined };
			return { ...item, [field]: value };
		}));
	}

	function selectSupplier(value: string) {
		setFornecedorId(value);
		const defaultCondition = fornecedores.find((option) => option.id === value)?.codcondicaoPagamento;
		setCondicaoId(defaultCondition ?? "");
		if (value !== fornecedorId) setDueDates({});
		invalidateKey();
	}

	function validateDates() {
		if (datesDisabled) return;
		if (!validateFields(dateFields)) return;
		setStepError("");
		setStep("products");
	}

	function validateProducts() {
		if (productsDisabled) return;
		if (!validateFields(productFields)) return;
		const error = !items.length ? "Adicione ao menos um produto à compra."
			: totals.produtos <= 0 || totals.total <= 0 || !Number.isFinite(totals.total) || totals.total >= 1e12
				? "O total dos produtos e o total da nota devem ser maiores que zero e inferiores a um trilhão. Confira os valores e descontos." : "";
		setStepError(error);
		if (!error) setStep("payment");
	}

	const terms = condicoesPagamento.find((option) => option.id === condicaoId)?.parcelas ?? [];
	const installmentValues = allocateInstallments(totals.total, terms.map((term) => term.percentual));
	const installmentError = !readOnly && terms.length > 0
		? !validPaymentPercentages(terms.map((term) => term.percentual))
			? "Os percentuais da condição de pagamento devem totalizar exatamente 100%."
			: installmentValues === null
			? "Não é possível fechar o total em centavos mantendo valores iguais para percentuais iguais. Revise o total ou os percentuais da condição de pagamento."
			: installmentValues.some((value) => value <= 0) ? "O total da nota é insuficiente para gerar todas as parcelas." : ""
		: "";
	const installments = readOnly ? initialPurchase!.parcelas : terms.map((term, index) => ({
		...term, dataVencimento: dueDates[`${condicaoId}:${dataEmissao}:${term.num_parcela}`] ?? addDays(dataEmissao, term.dias_vencimento),
		valor: installmentValues?.[index] ?? 0, status: "PREVISTA",
	}));
	const allocations = allocatePurchaseCosts(sumMoney([parseDecimal(valorFrete), parseDecimal(valorSeguro), parseDecimal(outrasDespesas)]), items.map(itemUnitValue));

	const moneyFields = [
		{ name: "valor_frete", label: "Frete", value: valorFrete, setter: setValorFrete },
		{ name: "valor_seguro", label: "Seguro", value: valorSeguro, setter: setValorSeguro },
		{ name: "outras_despesas", label: "Outras despesas", value: outrasDespesas, setter: setOutrasDespesas },
	];

	const keyFields = ["codfornecedor_display-trigger", "modelo", "serie", "numero_nota"];
	const dateFields = ["data_emissao", "data_chegada"];
	const productFields = [
		...items.flatMap((item) => [`produto-${item.id}-trigger`, `quantidade-${item.id}`, `unitario-${item.id}`, `desconto-${item.id}`]),
		...moneyFields.map((field) => field.name),
	];
	const paymentFields = ["codcondicao_pagamento-trigger", ...installments.map((parcela) => `compra-parcela-${parcela.num_parcela}-vencimento`)];
	const fieldErrors: Record<string, string> = {};
	if (!validPurchaseInteger(fornecedorId) || !fornecedores.some((supplier) => supplier.id === fornecedorId)) fieldErrors[keyFields[0]] = "Selecione um fornecedor válido.";
	if (!validPurchaseDigits(modelo, 2)) fieldErrors.modelo = "Informe o modelo com 1 ou 2 dígitos.";
	if (!validPurchaseDigits(serie, 3)) fieldErrors.serie = "Informe a série com 1 a 3 dígitos.";
	if (!validPurchaseDigits(numeroNota, 9)) fieldErrors.numero_nota = "Informe o número da nota com 1 a 9 dígitos.";
	if (!isIsoDate(dataEmissao) || dataEmissao > purchaseToday()) fieldErrors.data_emissao = "Informe uma emissão válida, igual ou anterior a hoje.";
	if (!isIsoDate(dataChegada) || dataChegada > purchaseToday()) fieldErrors.data_chegada = "Informe uma chegada válida, igual ou anterior a hoje.";
	else if (isIsoDate(dataEmissao) && dataChegada < dataEmissao) fieldErrors.data_chegada = "A chegada deve ser igual ou posterior à emissão.";
	for (const item of items) {
		if (!produtos.some((product) => product.id === item.codproduto)) fieldErrors[`produto-${item.id}-trigger`] = "Selecione um produto válido.";
		else if (items.some((other) => other.id !== item.id && other.codproduto === item.codproduto)) fieldErrors[`produto-${item.id}-trigger`] = "Este produto já está em outro item.";
		if (!validPurchaseQuantity(item.quantidade)) fieldErrors[`quantidade-${item.id}`] = "Informe uma quantidade maior que zero, até 2147483647, com até duas casas decimais.";
		if (!validPurchaseMoney(item.valor_unitario)) fieldErrors[`unitario-${item.id}`] = "Informe um valor não negativo, com até duas casas decimais.";
		if (!validPurchaseMoney(item.valor_desconto)) fieldErrors[`desconto-${item.id}`] = "Informe um desconto não negativo, com até duas casas decimais.";
		else if (validPurchaseMoney(item.valor_unitario) && purchaseDiscountExceedsTotal(1, itemUnitValue(item), parseDecimal(item.valor_desconto))) fieldErrors[`desconto-${item.id}`] = "O desconto por unidade não pode superar o valor unitário.";
	}
	for (const field of moneyFields) {
		if (!validPurchaseMoney(field.value)) fieldErrors[field.name] = "Informe um valor não negativo, com até duas casas decimais. Use 0,00 se não houver despesa.";
	}
	if (!terms.length) fieldErrors["codcondicao_pagamento-trigger"] = "Selecione uma condição com parcelas cadastradas.";
	for (const parcela of installments) {
		if (!isIsoDate(parcela.dataVencimento) || parcela.dataVencimento < dataEmissao) fieldErrors[`compra-parcela-${parcela.num_parcela}-vencimento`] = "Informe um vencimento válido, igual ou posterior à emissão.";
	}

	function fieldError(id: string) {
		return !readOnly && touchedFields[id] ? fieldErrors[id] : undefined;
	}

	function fieldValidationProps(id: string) {
		return { "aria-invalid": fieldError(id) ? true : undefined, "aria-describedby": fieldError(id) ? `${id}-error` : undefined } as const;
	}

	function fieldFeedback(id: string) {
		const error = fieldError(id);
		return error ? <p id={`${id}-error`} role="alert" className="text-sm text-red-700">{error}</p> : null;
	}

	function validateFields(ids: string[]) {
		setTouchedFields((current) => ({ ...current, ...Object.fromEntries(ids.map((id) => [id, true])) }));
		setStepError("");
		const firstInvalid = ids.find((id) => fieldErrors[id]);
		if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(firstInvalid)}`)?.focus();
		return !firstInvalid;
	}

	return (
		<form ref={formRef} action={readOnly ? undefined : createCompraAction} noValidate={!readOnly} className="space-y-5" onBlur={(event) => {
			const field = event.target;
			if (readOnly || disabled || !(field instanceof HTMLInputElement || field instanceof HTMLButtonElement) || field.disabled || field.getAttribute("aria-expanded") === "true") return;
			if (![...keyFields, ...dateFields, ...productFields, ...paymentFields].includes(field.id)) return;
			setTouchedFields((current) => ({ ...current, [field.id]: true }));
		}} onChangeCapture={() => { if (stepError) setStepError(""); }} onSubmit={(event) => {
			if (readOnly) return;
			if (paymentDisabled || !validateFields(paymentFields) || installmentError) event.preventDefault();
		}} onKeyDown={(event) => {
			if (event.defaultPrevented || event.nativeEvent.isComposing || event.key !== "Enter" || !(event.target instanceof HTMLInputElement) || !event.currentTarget.contains(event.target) || step === "payment") return;
			event.preventDefault();
			if (step === "key") void validateKey();
			if (step === "dates") validateDates();
			if (step === "products") validateProducts();
		}}>
			{!readOnly && <input type="hidden" name="desconto_tipo" value="UNITARIO" />}
			{readOnly ? null : <FormStatePersistence formKey="compras" onRestore={restoreDraft} />}
			{readOnly ? null : <><input type="hidden" name="vencimentos_json" value={JSON.stringify(installments.map((p) => p.dataVencimento))} /><input type="hidden" name="vencimentos_rascunho" value={JSON.stringify(dueDates)} /></>}
			{readOnly ? null : <input type="hidden" name="itens_json" value={JSON.stringify(items)} readOnly />}

			{!readOnly && Object.entries({ codfornecedor: fornecedorId, codcondicao_pagamento: condicaoId, modelo, serie, numero_nota: numeroNota,
				data_emissao: dataEmissao, data_chegada: dataChegada, valor_frete: valorFrete, valor_seguro: valorSeguro,
				outras_despesas: outrasDespesas,
			}).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
			{!readOnly && <p role="status" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-800">{
				{ key: "Etapa 1 de 4: chave da nota", dates: "Etapa 2 de 4: datas", products: "Etapa 3 de 4: produtos e despesas", payment: "Etapa 4 de 4: pagamento e observações" }[step]
			}</p>}

			<div data-purchase-step="key" className="grid gap-4 md:grid-cols-12">
					<SearchableSelect name="codfornecedor_display" label="Fornecedor" searchLabel="Pesquisar fornecedor" searchPlaceholder="Digite o nome do fornecedor" selectPlaceholder="Selecione um fornecedor" options={fornecedores} required={!readOnly} disabled={keyDisabled} value={fornecedorId} onValueChange={selectSupplier} error={fieldError("codfornecedor_display-trigger")} className="md:col-span-6" createHref={keyDisabled ? undefined : "/cadastro/fornecedores?mode=create"} createLabel="Novo fornecedor" />
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
						<Input id="modelo" {...fieldValidationProps("modelo")} name="modelo_display" maxLength={2} inputMode="numeric" pattern="[0-9]+" title="Informe somente dígitos." required={!readOnly} disabled={keyDisabled} value={modelo} onChange={(event) => { if (/^[0-9]{0,2}$/.test(event.target.value)) { setModelo(event.target.value); invalidateKey(); } }} placeholder="55" className={inputClass} />
						{fieldFeedback("modelo")}
					</div>
					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="serie" className="text-sm text-neutral-800">Série:</RequiredLabel>
						<Input id="serie" {...fieldValidationProps("serie")} name="serie_display" maxLength={3} inputMode="numeric" pattern="[0-9]+" title="Informe somente dígitos." required={!readOnly} disabled={keyDisabled} value={serie} onChange={(event) => { if (/^[0-9]{0,3}$/.test(event.target.value)) { setSerie(event.target.value); invalidateKey(); } }} placeholder="1" className={inputClass} />
						{fieldFeedback("serie")}
					</div>
					<div className={`${fieldClass} md:col-span-4`}>
						<RequiredLabel htmlFor="numero_nota" className="text-sm text-neutral-800">Número da nota:</RequiredLabel>
						<Input id="numero_nota" {...fieldValidationProps("numero_nota")} name="numero_nota_display" maxLength={9} inputMode="numeric" pattern="[0-9]+" title="Informe somente dígitos." required={!readOnly} disabled={keyDisabled} value={numeroNota} onChange={(event) => { if (/^[0-9]{0,9}$/.test(event.target.value)) { setNumeroNota(event.target.value); invalidateKey(); } }} placeholder="Ex: 000012345" className={inputClass} />
						{fieldFeedback("numero_nota")}
					</div>
			</div>
			{!readOnly && step === "key" && <div className="space-y-2">
				{keyMessage && <p role="alert" className="text-sm text-red-700">{keyMessage}</p>}
				<Button type="button" onClick={() => void validateKey()} disabled={keyDisabled} aria-busy={validating} className="h-11 w-full rounded-xl sm:w-auto">{validating ? "Validando a nota..." : "Validar e continuar"}</Button>
			</div>}
			<fieldset data-purchase-step="dates" disabled={datesDisabled} className="min-w-0 space-y-5">
			<div className="grid gap-4 md:grid-cols-12">
					<DatePickerInput
						id="data_emissao"
						name="data_emissao_display"
						label="Emissão"
						max={purchaseToday()}
						value={dataEmissao} onChange={setDataEmissao}
						error={fieldError("data_emissao")}
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
						max={purchaseToday()}
						value={dataChegada} onChange={setDataChegada}
						error={fieldError("data_chegada")}
						required={!readOnly}
						disabled={datesDisabled}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>
			</div>

			</fieldset>
			{!readOnly && step === "dates" && <div className="space-y-2">
				<Button type="button" onClick={validateDates} disabled={datesDisabled} className="h-11 w-full rounded-xl sm:w-auto">Validar e continuar</Button>
			</div>}
			<fieldset data-purchase-step="products" disabled={productsDisabled} className="min-w-0 space-y-5">

			<div className="pt-3">
				<div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div><h3 className="font-semibold text-neutral-900">Itens da compra</h3><p className="mt-1 text-sm text-neutral-500">Produtos, quantidades e valores que compõem a compra.</p></div>
					{readOnly ? null : (
						<Button type="button" variant="outline" onClick={() => setItems((current) => [...current, newItem(current.length)])} className="h-10 rounded-xl border-neutral-300">
							<Plus className="h-4 w-4" aria-hidden="true" />Adicionar item
						</Button>
					)}
				</div>

				<div className="space-y-3">
					{items.map((item, index) => {
						const subtotal = itemTotal(item, readOnly);
						const allocation = readOnly ? item.valorRateio : allocations[index];
						const validQuantity = validPurchaseQuantity(item.quantidade);
						const quantity = validQuantity ? parsePurchaseQuantity(item.quantidade) : 0;
						const unitAllocation = validQuantity ? (allocation ?? 0) / quantity : 0;
						const unitCost = validQuantity ? Number(itemUnitValue(item)) + unitAllocation : 0;
						const product = produtos.find((product) => product.id === item.codproduto);
						const averageCost = !readOnly && product && validQuantity
							? purchaseAverageCost(product.estoque, Number(product.precoCusto), quantity, unitCost)
							: null;
						const approximateAllocation = validQuantity && purchaseItemTotal(quantity, unitAllocation.toFixed(6), 0) !== (allocation ?? 0);
						const storedDiscount = parseDecimal(item.valor_desconto);
						const unitDiscount = readOnly && validQuantity ? storedDiscount / quantity : 0;
						const approximateDiscount = readOnly && validQuantity && purchaseUnitDiscountTotal(quantity, roundMoney(unitDiscount)) !== storedDiscount;
						const discountDisplay = readOnly ? decimalText(unitDiscount) : item.valor_desconto;

						return (
							<div key={item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
								<div className="grid items-start gap-4 md:grid-cols-14 md:[&_label]:block md:[&_label]:min-h-10">
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
												label: product.label,
											}))}
										required={!readOnly}
										disabled={productsDisabled}
										value={item.codproduto}
										onValueChange={(value) => updateItem(item.id, "codproduto", value)}
										error={fieldError(`produto-${item.id}-trigger`)}
										className="min-w-0 md:col-span-5"
										createHref={productsDisabled ? undefined : "/cadastro/produtos-servicos/produtos?mode=create"}
										createLabel="Novo produto"
									/>
									<div className={`${fieldClass} md:col-span-2`}>
										<Label htmlFor={`estoque-${item.id}`} className="text-sm text-neutral-800">Estoque atual:</Label>
										<Input id={`estoque-${item.id}`} value={product ? `${product.estoque.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${product.unidade}` : ""} placeholder="—" title="Saldo atual do produto e sua unidade de medida." readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600" />
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`quantidade-${item.id}`} className="text-sm text-neutral-800">Quantidade:</RequiredLabel>
										<Input id={`quantidade-${item.id}`} {...fieldValidationProps(`quantidade-${item.id}`)} type="text" inputMode="decimal" pattern={PURCHASE_QUANTITY_PATTERN} maxLength={13} title="Informe uma quantidade maior que zero, com até duas casas decimais (ex.: 1,25)." required={!readOnly} disabled={productsDisabled} value={item.quantidade} onChange={(event) => { const value = event.target.value; if (canTypePurchaseQuantity(value)) updateItem(item.id, "quantidade", value); }} onBlur={() => { if (validPurchaseQuantity(item.quantidade)) updateItem(item.id, "quantidade", decimalText(parsePurchaseQuantity(item.quantidade))); }} className={inputClass} />
										{fieldFeedback(`quantidade-${item.id}`)}
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`unitario-${item.id}`} className="text-sm text-neutral-800">Valor unitário:</RequiredLabel>
										<Input id={`unitario-${item.id}`} {...fieldValidationProps(`unitario-${item.id}`)} inputMode="decimal" maxLength={18} pattern={PURCHASE_MONEY_PATTERN} title="Informe um valor não negativo, com até duas casas decimais (ex.: 1.234,56)." required={!readOnly} disabled={productsDisabled} value={item.valor_unitario} onChange={(event) => { if (canTypePurchaseMoney(event.target.value)) updateItem(item.id, "valor_unitario", event.target.value); }} className={inputClass} />
										{fieldFeedback(`unitario-${item.id}`)}
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<Label htmlFor={`desconto-${item.id}`} className="text-sm text-neutral-800">Desconto unitário (R$):</Label>
										<Input id={`desconto-${item.id}`} {...fieldValidationProps(`desconto-${item.id}`)} inputMode="decimal" maxLength={18} pattern={PURCHASE_MONEY_PATTERN} title={readOnly ? `Desconto total registrado no item: ${currency(storedDiscount)}.${approximateDiscount ? " Valor unitário aproximado." : ""}` : "Informe um valor não negativo, com até duas casas decimais (ex.: 1.234,56)."} disabled={productsDisabled} value={discountDisplay} onChange={(event) => { if (canTypePurchaseMoney(event.target.value)) updateItem(item.id, "valor_desconto", event.target.value); }} className={inputClass} />
										{fieldFeedback(`desconto-${item.id}`)}
									</div>

								</div>
								<div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
									<div className={`${fieldClass} w-full sm:w-48`}>
										<Label htmlFor={`rateio-${item.id}`} className="text-sm text-neutral-800">Rateio por unidade (R$):</Label>
										<Input id={`rateio-${item.id}`} value={currency(unitAllocation, 6)} title={`Rateio total do item: ${currency(allocation ?? 0)}.${approximateAllocation ? " Valor por unidade arredondado na exibição." : ""}`} readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600" />
									</div>
									<div className={`${fieldClass} w-full sm:w-48`}>
										<Label htmlFor={`custo-unitario-${item.id}`} className="text-sm text-neutral-800">Custo unitário:</Label>
										<Input id={`custo-unitario-${item.id}`} value={currency(unitCost, 6)} title="Valor unitário + rateio por unidade." readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600" />
									</div>
									{!readOnly && (
										<div className={`${fieldClass} w-full sm:w-48`}>
											<Label htmlFor={`custo-medio-${item.id}`} className="text-sm text-neutral-800">Custo médio:</Label>
											<Input id={`custo-medio-${item.id}`} value={averageCost === null ? "" : currency(averageCost, 6)} placeholder="Selecione um produto" title="(Estoque atual × custo atual + quantidade comprada × custo unitário) ÷ (estoque atual + quantidade comprada). Recalculado ao salvar com o estoque atualizado." readOnly className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600" />
										</div>
									)}
									<div className={`${fieldClass} w-full sm:w-48`}>
										<Label className="text-sm text-neutral-800">Total do Item:</Label>
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

			<p className="text-right text-lg font-semibold text-black">Total dos produtos: {currency(totals.produtos)}</p>
			<div className="grid gap-4 pt-3 md:w-[70%] md:grid-cols-12">
				{moneyFields.map((field) => (
					<div key={field.name} className={`${fieldClass} md:col-span-4`}>
						<Label htmlFor={field.name} className="text-sm text-neutral-800">{field.label}:</Label>
						<Input id={field.name} {...fieldValidationProps(field.name)} name={`${field.name}_display`} inputMode="decimal" maxLength={18} pattern={PURCHASE_MONEY_PATTERN} title="Informe um valor não negativo, com até duas casas decimais (ex.: 1.234,56)." disabled={productsDisabled} value={field.value} onChange={(event) => { if (canTypePurchaseMoney(event.target.value)) field.setter(event.target.value); }} className={inputClass} />
						{fieldFeedback(field.name)}
					</div>
				))}
			</div>

			</fieldset>
			{!readOnly && step === "products" && <div className="space-y-2">
				<p className="text-sm text-neutral-600">Confira os produtos e as despesas. Valide esta etapa para continuar ao pagamento.</p>
				{stepError && <p role="alert" className="text-sm text-red-700">{stepError}</p>}
				<Button type="button" onClick={validateProducts} disabled={productsDisabled} className="h-11 w-full rounded-xl sm:w-auto">Validar e continuar</Button>
			</div>}
			<fieldset disabled={paymentDisabled} className="min-w-0 space-y-5">

			<div className="grid gap-4 md:grid-cols-12">
				<SearchableSelect id="codcondicao_pagamento" name="codcondicao_pagamento_display" label="Condição de pagamento" searchLabel="Pesquisar condição" searchPlaceholder="Digite a condição de pagamento" selectPlaceholder="Selecione a condição" options={condicoesPagamento} required={!readOnly} disabled={paymentDisabled} value={condicaoId} onValueChange={setCondicaoId} error={fieldError("codcondicao_pagamento-trigger")} className="md:col-span-5" createHref={paymentDisabled ? undefined : "/cadastro/condicoes-pagamento?mode=create"} createLabel="Nova condição" />
				<div className="md:col-span-7 md:text-right">
					<p className="text-sm text-neutral-500">Valor total da nota</p>
					<p className="mt-1 text-2xl font-bold text-neutral-900">{currency(totals.total)}</p>
				</div>
			</div>

			{installmentError && <p role="alert" className="text-sm text-red-700">{installmentError}</p>}
			{!readOnly && step === "payment" && stepError && <p role="alert" className="text-sm text-red-700">{stepError}</p>}
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
						{ id: "valor", label: "Valor", value: installmentValues === null && !readOnly ? "—" : currency(parcela.valor), span: "md:col-span-3" },
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
							error={fieldError(`${prefix}-vencimento`)}
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
				<Textarea id="observacoes" name="observacoes" maxLength={255} rows={4} disabled={paymentDisabled} defaultValue={initialPurchase?.observacoes} placeholder="Informações adicionais da nota ou do recebimento" className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-hidden transition focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600" />
			</div>

			<div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
					<span>{items.length} item(ns)</span>
					<span>Produtos: {currency(totals.produtos)}</span>
					<span>Acréscimos: {currency(parseDecimal(valorFrete) + parseDecimal(valorSeguro) + parseDecimal(outrasDespesas))}</span>
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
				<Button type="submit" disabled={paymentDisabled || Boolean(installmentError) || installments.length === 0 || fornecedores.length === 0 || condicoesPagamento.length === 0 || produtos.length === 0} className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar compra</Button>
			)}
		</form>
	);
}
