"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { SearchableSelect } from "@/components/forms/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = {
	id: string;
	label: string;
};

type Parcela = {
	num_parcela: number;
	dias_vencimento: number;
	codforma_pagamento: string;
	percentual: string;
};

type ParcelasCondicaoFieldsProps = {
	formaPagamentoOptions: Option[];
	initialParcelas?: Array<{
		num_parcela: number;
		dias_vencimento: number;
		codforma_pagamento: number;
		percentual: number | string;
	}>;
};

const inputClass =
	"h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-neutral-800";

function createInitialParcelas(
	initialParcelas: ParcelasCondicaoFieldsProps["initialParcelas"],
	formaPagamentoOptions: Option[]
): Parcela[] {
	if (initialParcelas?.length) {
		return initialParcelas.map((parcela) => ({
			num_parcela: parcela.num_parcela,
			dias_vencimento: parcela.dias_vencimento,
			codforma_pagamento: String(parcela.codforma_pagamento),
			percentual: String(parcela.percentual),
		}));
	}

	return [
		{
			num_parcela: 1,
			dias_vencimento: 0,
			codforma_pagamento: formaPagamentoOptions[0]?.id ?? "",
			percentual: "100",
		},
	];
}

export function ParcelasCondicaoFields({
	formaPagamentoOptions,
	initialParcelas,
}: ParcelasCondicaoFieldsProps) {
	const [parcelas, setParcelas] = useState(() =>
		createInitialParcelas(initialParcelas, formaPagamentoOptions)
	);

	function updateParcela(index: number, field: keyof Omit<Parcela, "num_parcela">, value: string) {
		setParcelas((current) =>
			current.map((parcela, parcelaIndex) =>
				parcelaIndex === index
					? {
							...parcela,
							[field]: field === "dias_vencimento" ? Number(value) : value,
						}
					: parcela
			)
		);
	}

	function addParcela() {
		setParcelas((current) => [
			...current,
			{
				num_parcela: current.length + 1,
				dias_vencimento: 0,
				codforma_pagamento:
					current.at(-1)?.codforma_pagamento ?? formaPagamentoOptions[0]?.id ?? "",
				percentual: "0",
			},
		]);
	}

	function removeParcela(index: number) {
		setParcelas((current) =>
			current
				.filter((_, parcelaIndex) => parcelaIndex !== index)
				.map((parcela, parcelaIndex) => ({
					...parcela,
					num_parcela: parcelaIndex + 1,
				}))
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h3 className="text-base font-semibold text-neutral-900">Parcelas</h3>
					<p className="text-sm text-neutral-500">
						Adicione as parcelas para esta condição de pagamento. O percentual total deve ser igual a 100%.
					</p>
				</div>

				<Button type="button" variant="outline" onClick={addParcela} className="rounded-xl">
					<Plus className="mr-2 h-4 w-4" />
					Adicionar parcela
				</Button>
			</div>

			<div className="space-y-3">
				{parcelas.map((parcela, index) => (
					<div
						key={parcela.num_parcela}
						className="grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-12"
					>
						<input type="hidden" name="parcela_numero" value={parcela.num_parcela} />

						<div className="flex flex-col gap-2 md:col-span-2">
							<Label
								htmlFor={`parcela-numero-${parcela.num_parcela}`}
								className={labelClass}
							>
								Parcela:
							</Label>
							<Input
								id={`parcela-numero-${parcela.num_parcela}`}
								value={parcela.num_parcela}
								readOnly
								className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
							/>
						</div>

						<div className="flex flex-col gap-2 md:col-span-3">
							<RequiredLabel
								htmlFor={`dias-vencimento-${parcela.num_parcela}`}
								className={labelClass}
							>
								Dias para vencimento:
							</RequiredLabel>
							<Input
								id={`dias-vencimento-${parcela.num_parcela}`}
								name="parcela_dias_vencimento"
								type="number"
								min={0}
								required
								value={parcela.dias_vencimento}
								onChange={(event) =>
									updateParcela(index, "dias_vencimento", event.target.value)
								}
								className={inputClass}
							/>
						</div>

						<SearchableSelect
							id={`forma-pagamento-${parcela.num_parcela}`}
							name="parcela_codforma_pagamento"
							label="Forma de Pagamento"
							searchLabel="Pesquisar forma de pagamento"
							searchPlaceholder="Digite a forma de pagamento"
							selectPlaceholder="Selecione uma forma"
							options={formaPagamentoOptions}
							required
							value={parcela.codforma_pagamento}
							className="md:col-span-4"
							createHref="/cadastro/formas-pagamento?mode=create"
							createLabel="Nova forma"
							onValueChange={(value) =>
								updateParcela(index, "codforma_pagamento", value)
							}
						/>

						<div className="flex flex-col gap-2 md:col-span-2">
							<RequiredLabel
								htmlFor={`percentual-${parcela.num_parcela}`}
								className={labelClass}
							>
								Percentual:
							</RequiredLabel>
							<Input
								id={`percentual-${parcela.num_parcela}`}
								name="parcela_percentual"
								type="text"
								inputMode="decimal"
								required
								value={parcela.percentual}
								onChange={(event) =>
									updateParcela(index, "percentual", event.target.value)
								}
								className={inputClass}
							/>
						</div>

						<div className="flex flex-col gap-2 md:col-span-1">
							<Label className={labelClass}>Ações:</Label>
							<Button
								type="button"
								variant="outline"
								size="icon"
								disabled={parcelas.length === 1}
								onClick={() => removeParcela(index)}
								aria-label={`Remover parcela ${parcela.num_parcela}`}
								className="h-11 w-11 rounded-xl text-red-600"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
