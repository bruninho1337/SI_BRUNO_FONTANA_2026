"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

import { createCompraAction } from "@/app/cadastro/compras/actions";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { DatePickerInput } from "@/components/forms/date-picker-input";
import { FormStatePersistence } from "@/components/forms/form-state-persistence";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";

type SupplierOption = { id: string; label: string; codcondicaoPagamento: string };
type Option = { id: string; label: string };
type ProductOption = Option & { precoCusto: number; estoque: number; unidade: string };
type PurchaseItem = {
	id: string;
	codproduto: string;
	quantidade: string;
	valor_unitario: string;
	valor_desconto: string;
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
	dataCriacao: string;
	dataAtualizacao: string;
	itens: PurchaseItem[];
};
type CompraFormProps = {
	fornecedores: SupplierOption[];
	condicoesPagamento: Option[];
	produtos: ProductOption[];
	disabled?: boolean;
	initialPurchase?: PurchaseInitial;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 disabled:opacity-100";
const fieldClass = "flex flex-col gap-2";

function localToday() {
	const today = new Date();
	const local = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 10);
}

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
	const [items, setItems] = useState<PurchaseItem[]>(initialPurchase?.itens ?? [newItem(0, "item-0")]);
	const [valorFrete, setValorFrete] = useState(initialPurchase?.valorFrete ?? "0,00");
	const [valorSeguro, setValorSeguro] = useState(initialPurchase?.valorSeguro ?? "0,00");
	const [outrasDespesas, setOutrasDespesas] = useState(initialPurchase?.outrasDespesas ?? "0,00");
	const [valorDesconto, setValorDesconto] = useState(initialPurchase?.valorDesconto ?? "0,00");

	useEffect(() => {
		if (readOnly) return;

		function restoreDraft(event: Event) {
			const detail = (event as CustomEvent<Record<string, string>>).detail;
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

			setValorFrete(detail?.valor_frete ?? "0,00");
			setValorSeguro(detail?.valor_seguro ?? "0,00");
			setOutrasDespesas(detail?.outras_despesas ?? "0,00");
			setValorDesconto(detail?.valor_desconto ?? "0,00");
		}

		window.addEventListener("form-draft-restored", restoreDraft);
		return () => window.removeEventListener("form-draft-restored", restoreDraft);
	}, [readOnly]);

	const totals = useMemo(() => {
		const produtosTotal = items.reduce((total, item) => {
			const quantidade = Number(item.quantidade) || 0;
			return total + Math.max(0, quantidade * parseDecimal(item.valor_unitario) - parseDecimal(item.valor_desconto));
		}, 0);
		const total = produtosTotal + parseDecimal(valorFrete) + parseDecimal(valorSeguro) + parseDecimal(outrasDespesas) - parseDecimal(valorDesconto);
		return { produtos: produtosTotal, total: Math.max(0, total) };
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
		if (defaultCondition) setCondicaoId(defaultCondition);
	}

	const moneyFields = [
		{ name: "valor_frete", label: "Frete", value: valorFrete, setter: setValorFrete },
		{ name: "valor_seguro", label: "Seguro", value: valorSeguro, setter: setValorSeguro },
		{ name: "outras_despesas", label: "Outras despesas", value: outrasDespesas, setter: setOutrasDespesas },
		{ name: "valor_desconto", label: "Desconto geral", value: valorDesconto, setter: setValorDesconto },
	];

	return (
		<form action={readOnly ? undefined : createCompraAction} className="space-y-5">
			{readOnly ? null : <FormStatePersistence formKey="compras" />}
			{readOnly ? null : <input type="hidden" name="itens_json" value={JSON.stringify(items)} readOnly />}

			<div className="grid gap-4 md:grid-cols-12">
					<SearchableSelect name="codfornecedor" label="Fornecedor" searchLabel="Pesquisar fornecedor" searchPlaceholder="Digite o nome do fornecedor" selectPlaceholder="Selecione um fornecedor" options={fornecedores} required={!readOnly} disabled={readOnly} value={fornecedorId} onValueChange={selectSupplier} className="md:col-span-6" createHref={readOnly ? undefined : "/cadastro/fornecedores?mode=create"} createLabel="Novo fornecedor" />
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
						<Input id="modelo" name="modelo" maxLength={10} required={!readOnly} disabled={readOnly} defaultValue={initialPurchase?.modelo} placeholder="55" className={inputClass} />
					</div>
					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="serie" className="text-sm text-neutral-800">Série:</RequiredLabel>
						<Input id="serie" name="serie" maxLength={10} required={!readOnly} disabled={readOnly} defaultValue={initialPurchase?.serie} placeholder="1" className={inputClass} />
					</div>
					<div className={`${fieldClass} md:col-span-4`}>
						<RequiredLabel htmlFor="numero_nota" className="text-sm text-neutral-800">Número da nota:</RequiredLabel>
						<Input id="numero_nota" name="numero_nota" maxLength={30} required={!readOnly} disabled={readOnly} defaultValue={initialPurchase?.numeroNota} placeholder="Ex: 000012345" className={inputClass} />
					</div>
					<DatePickerInput
						id="data_emissao"
						name="data_emissao"
						label="Emissão"
						max={localToday()}
						defaultValue={initialPurchase?.dataEmissao ?? localToday()}
						required={!readOnly}
						disabled={readOnly}
						className={`${fieldClass} md:col-span-3 md:col-start-1`}
						inputClassName={inputClass}
					/>
					<DatePickerInput
						id="data_chegada"
						name="data_chegada"
						label="Chegada"
						defaultValue={initialPurchase?.dataChegada ?? localToday()}
						required={!readOnly}
						disabled={readOnly}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>
			</div>

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
						const subtotal = Math.max(0, (Number(item.quantidade) || 0) * parseDecimal(item.valor_unitario) - parseDecimal(item.valor_desconto));

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
										disabled={readOnly}
										value={item.codproduto}
										onValueChange={(value) => updateItem(item.id, "codproduto", value)}
										className="md:col-span-5"
										createHref={readOnly ? undefined : "/cadastro/produtos-servicos/produtos?mode=create"}
										createLabel="Novo produto"
									/>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`quantidade-${item.id}`} className="text-sm text-neutral-800">Quantidade:</RequiredLabel>
										<Input id={`quantidade-${item.id}`} type="number" min={1} step={1} required={!readOnly} disabled={readOnly} value={item.quantidade} onChange={(event) => updateItem(item.id, "quantidade", event.target.value)} className={inputClass} />
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<RequiredLabel htmlFor={`unitario-${item.id}`} className="text-sm text-neutral-800">Custo unitário:</RequiredLabel>
										<Input id={`unitario-${item.id}`} inputMode="decimal" required={!readOnly} disabled={readOnly} value={item.valor_unitario} onChange={(event) => updateItem(item.id, "valor_unitario", normalizeMoneyInput(event.target.value))} className={inputClass} />
									</div>
									<div className={`${fieldClass} md:col-span-2`}>
										<Label htmlFor={`desconto-${item.id}`} className="text-sm text-neutral-800">Desconto:</Label>
										<Input id={`desconto-${item.id}`} inputMode="decimal" disabled={readOnly} value={item.valor_desconto} onChange={(event) => updateItem(item.id, "valor_desconto", normalizeMoneyInput(event.target.value))} className={inputClass} />
									</div>
								</div>
								<div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
									<div className={`${fieldClass} w-full sm:w-48`}>
										<Label className="text-sm text-neutral-800">Subtotal:</Label>
										<div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900">{currency(subtotal)}</div>
									</div>
									<div className={fieldClass}>
										<Label className="text-sm font-medium text-neutral-800">Ações:</Label>
										<Button type="button" variant="outline" size="icon" disabled={readOnly || items.length === 1} onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} className="h-11 w-11 rounded-xl text-red-600" title="Remover item" aria-label={`Remover item ${index + 1}`}>
											<Trash2 className="h-4 w-4" aria-hidden="true" />
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="grid gap-4 pt-3 md:grid-cols-12">
				{moneyFields.map((field) => (
					<div key={field.name} className={`${fieldClass} md:col-span-3`}>
						<Label htmlFor={field.name} className="text-sm text-neutral-800">{field.label}:</Label>
						<Input id={field.name} name={field.name} inputMode="decimal" disabled={readOnly} value={field.value} onChange={(event) => field.setter(normalizeMoneyInput(event.target.value))} className={inputClass} />
					</div>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<SearchableSelect name="codcondicao_pagamento" label="Condição de pagamento" searchLabel="Pesquisar condição" searchPlaceholder="Digite a condição de pagamento" selectPlaceholder="Selecione a condição" options={condicoesPagamento} required={!readOnly} disabled={readOnly} value={condicaoId} onValueChange={setCondicaoId} className="md:col-span-5" createHref={readOnly ? undefined : "/cadastro/condicoes-pagamento?mode=create"} createLabel="Nova condição" />
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="observacoes" className="text-sm text-neutral-800">Observações:</Label>
				<textarea id="observacoes" name="observacoes" maxLength={255} rows={4} disabled={readOnly} defaultValue={initialPurchase?.observacoes} placeholder="Informações adicionais da nota ou do recebimento" className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600" />
			</div>

			<div className="flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
					<span>{items.length} item(ns)</span>
					<span>Produtos: {currency(totals.produtos)}</span>
					<span>Acréscimos: {currency(parseDecimal(valorFrete) + parseDecimal(valorSeguro) + parseDecimal(outrasDespesas))}</span>
					<span>Desconto: {currency(parseDecimal(valorDesconto))}</span>
				</div>
				<div className="shrink-0 text-left sm:text-right">
					<p className="text-sm text-neutral-500">Total da compra</p>
					<p className="mt-1 text-2xl font-bold text-neutral-900">{currency(totals.total)}</p>
				</div>
			</div>

			{readOnly ? (
				<AuditDates
					createdAt={initialPurchase?.dataCriacao}
					updatedAt={initialPurchase?.dataAtualizacao}
				/>
			) : null}

			{readOnly ? (
				<Button asChild variant="outline" className="h-11 w-full rounded-xl border-neutral-300"><Link href="/cadastro/compras">Voltar</Link></Button>
			) : (
				<Button type="submit" disabled={disabled || fornecedores.length === 0 || condicoesPagamento.length === 0 || produtos.length === 0} className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar compra</Button>
			)}
		</form>
	);
}
