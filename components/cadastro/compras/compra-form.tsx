"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PackagePlus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { createCompraAction } from "@/app/cadastro/compras/actions";
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
	codcompra: string;
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
		<form action={readOnly ? undefined : createCompraAction} className="space-y-6">
			{readOnly ? null : <FormStatePersistence formKey="compras" />}
			{readOnly ? null : <input type="hidden" name="itens_json" value={JSON.stringify(items)} readOnly />}

			<section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 md:p-5">
				<div className="mb-4 flex items-center gap-3">
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
						<ShoppingCart className="h-5 w-5" aria-hidden="true" />
					</span>
					<div>
						<h3 className="font-semibold text-neutral-900">Dados da nota</h3>
						<p className="text-sm text-neutral-500">Fornecedor, condição e identificação fiscal.</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<SearchableSelect name="codfornecedor" label="Fornecedor" searchLabel="Pesquisar fornecedor" searchPlaceholder="Digite o nome do fornecedor" selectPlaceholder="Selecione um fornecedor" options={fornecedores} required={!readOnly} disabled={readOnly} value={fornecedorId} onValueChange={selectSupplier} className="md:col-span-6" createHref={readOnly ? undefined : "/cadastro/fornecedores?mode=create"} createLabel="Novo fornecedor" />
					<SearchableSelect name="codcondicao_pagamento" label="Condição de pagamento" searchLabel="Pesquisar condição" searchPlaceholder="Digite a condição de pagamento" selectPlaceholder="Selecione a condição" options={condicoesPagamento} required={!readOnly} disabled={readOnly} value={condicaoId} onValueChange={setCondicaoId} className="md:col-span-6" createHref={readOnly ? undefined : "/cadastro/condicoes-pagamento?mode=create"} createLabel="Nova condição" />

					<div className={`${fieldClass} md:col-span-2`}>
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
					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="data_emissao" className="text-sm text-neutral-800">Emissão:</RequiredLabel>
						<Input id="data_emissao" name="data_emissao" type="date" max={localToday()} defaultValue={initialPurchase?.dataEmissao ?? localToday()} required={!readOnly} disabled={readOnly} className={inputClass} />
					</div>
					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="data_chegada" className="text-sm text-neutral-800">Chegada:</RequiredLabel>
						<Input id="data_chegada" name="data_chegada" type="date" defaultValue={initialPurchase?.dataChegada ?? localToday()} required={!readOnly} disabled={readOnly} className={inputClass} />
					</div>
				</div>
			</section>

			<section className="rounded-2xl border border-neutral-200 p-4 md:p-5">
				<div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><PackagePlus className="h-5 w-5" aria-hidden="true" /></span>
						<div><h3 className="font-semibold text-neutral-900">Itens da compra</h3><p className="text-sm text-neutral-500">Ao menos um produto é obrigatório.</p></div>
					</div>
					{readOnly ? null : (
						<Button type="button" variant="outline" onClick={() => setItems((current) => [...current, newItem(current.length)])} className="h-10 rounded-xl border-neutral-300">
							<Plus className="h-4 w-4" aria-hidden="true" />Adicionar item
						</Button>
					)}
				</div>

				<div className="space-y-3">
					{items.map((item, index) => {
						const selected = produtos.find((product) => product.id === item.codproduto);
						const subtotal = Math.max(0, (Number(item.quantidade) || 0) * parseDecimal(item.valor_unitario) - parseDecimal(item.valor_desconto));

						return (
							<div key={item.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
								<div className="mb-3 flex items-center justify-between">
									<p className="text-sm font-semibold text-neutral-700">Item {index + 1}</p>
									{readOnly ? null : (
										<Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700" title="Remover item">
											<Trash2 className="h-4 w-4" aria-hidden="true" />
										</Button>
									)}
								</div>

								<div className="grid gap-4 md:grid-cols-12">
									<div className={`${fieldClass} md:col-span-4`}>
										<RequiredLabel htmlFor={`produto-${item.id}`} className="text-sm text-neutral-800">Produto:</RequiredLabel>
										<select id={`produto-${item.id}`} value={item.codproduto} onChange={(event) => updateItem(item.id, "codproduto", event.target.value)} required={!readOnly} disabled={readOnly} className={inputClass}>
											<option value="">Selecione um produto</option>
											{produtos.map((product) => (
												<option key={product.id} value={product.id} disabled={items.some((other) => other.id !== item.id && other.codproduto === product.id)}>
													{product.label} · estoque {product.estoque} {product.unidade}
												</option>
											))}
										</select>
									</div>
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
									<div className={`${fieldClass} md:col-span-2`}>
										<Label className="text-sm text-neutral-800">Subtotal:</Label>
										<div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900">{currency(subtotal)}</div>
									</div>
								</div>
								{selected ? <p className="mt-3 text-xs text-neutral-500">Estoque atual: {selected.estoque} {selected.unidade}</p> : null}
							</div>
						);
					})}
				</div>
			</section>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
				<section className="rounded-2xl border border-neutral-200 p-4 md:p-5">
					<h3 className="font-semibold text-neutral-900">Ajustes e observações</h3>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						{moneyFields.map((field) => (
							<div key={field.name} className={fieldClass}>
								<Label htmlFor={field.name} className="text-sm text-neutral-800">{field.label}:</Label>
								<Input id={field.name} name={field.name} inputMode="decimal" disabled={readOnly} value={field.value} onChange={(event) => field.setter(normalizeMoneyInput(event.target.value))} className={inputClass} />
							</div>
						))}
					</div>
					<div className="mt-4 flex flex-col gap-2">
						<Label htmlFor="observacoes" className="text-sm text-neutral-800">Observações:</Label>
						<textarea id="observacoes" name="observacoes" maxLength={255} rows={4} disabled={readOnly} defaultValue={initialPurchase?.observacoes} placeholder="Informações adicionais da nota ou do recebimento" className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600" />
					</div>
				</section>

				<aside className="rounded-2xl bg-neutral-900 p-5 text-white shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Resumo</p>
					<div className="mt-5 space-y-3 text-sm">
						<div className="flex items-center justify-between gap-4 text-neutral-300"><span>Itens</span><span>{items.length}</span></div>
						<div className="flex items-center justify-between gap-4 text-neutral-300"><span>Produtos</span><span>{currency(totals.produtos)}</span></div>
						<div className="flex items-center justify-between gap-4 text-neutral-300"><span>Acréscimos</span><span>{currency(parseDecimal(valorFrete) + parseDecimal(valorSeguro) + parseDecimal(outrasDespesas))}</span></div>
						<div className="flex items-center justify-between gap-4 text-neutral-300"><span>Desconto</span><span>- {currency(parseDecimal(valorDesconto))}</span></div>
					</div>
					<div className="mt-5 border-t border-neutral-700 pt-5"><p className="text-sm text-neutral-400">Total da compra</p><p className="mt-1 text-3xl font-bold tracking-tight">{currency(totals.total)}</p></div>
				</aside>
			</div>

			<div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
				<Button asChild variant="outline" className="h-11 rounded-xl border-neutral-300 px-6"><Link href="/cadastro/compras">{readOnly ? "Voltar" : "Cancelar"}</Link></Button>
				{readOnly ? null : (
					<Button type="submit" disabled={disabled || fornecedores.length === 0 || condicoesPagamento.length === 0 || produtos.length === 0} className="h-11 rounded-xl bg-neutral-900 px-6 text-white hover:bg-neutral-800">
						<ShoppingCart className="h-4 w-4" aria-hidden="true" />Salvar compra
					</Button>
				)}
			</div>
		</form>
	);
}
