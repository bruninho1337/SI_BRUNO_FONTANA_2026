import {
	createFormaPagamentoAction,
	updateFormaPagamentoAction,
} from "@/app/cadastro/formas-pagamento/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarFormaPagamentoPorId } from "@/lib/formas-pagamento";

type FormaPagamentoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = "flex flex-col gap-2";

const tipoOptions = [
	{ value: "DINHEIRO", label: "Dinheiro" },
	{ value: "PIX", label: "PIX" },
	{ value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
	{ value: "CARTAO_DEBITO", label: "Cartão de Débito" },
	{ value: "BOLETO", label: "Boleto" },
	{ value: "TRANSFERENCIA", label: "Transferência" },
	{ value: "OUTROS", label: "Outros" },
];

export async function FormaPagamentoFormSection({
	searchParams,
}: FormaPagamentoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: formaEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarFormaPagamentoPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{formaEditando ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre dinheiro, PIX, cartoes, boletos e outros meios de pagamento.
				</p>
			</div>

			<FormFeedback params={params} />

			<form
				action={formaEditando ? updateFormaPagamentoAction : createFormaPagamentoAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{formaEditando ? (
						<input
							type="hidden"
							name="codforma_pagamento"
							value={formaEditando.codforma_pagamento}
						/>
					) : null}

					<div className={`${fieldClass} md:col-span-2`}>
						<Label htmlFor="codforma-pagamento-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codforma-pagamento-display"
							value={formaEditando?.codforma_pagamento ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-5`}>
						<RequiredLabel htmlFor="forma_pagamento" className="text-sm text-neutral-800">
							Forma de Pagamento:
						</RequiredLabel>
						<Input
							id="forma_pagamento"
							name="forma_pagamento"
							type="text"
							minLength={2}
							maxLength={80}
							required
							placeholder="Ex: PIX, Dinheiro, Cartão de Crédito"
							defaultValue={formaEditando?.forma_pagamento ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="tipo" className="text-sm text-neutral-800">
							Tipo:
						</RequiredLabel>
						<select
							id="tipo"
							name="tipo"
							required
							defaultValue={formaEditando?.tipo ?? "OUTROS"}
							className={inputClass}
						>
							{tipoOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={formaEditando?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva regras, observacoes ou detalhes da forma de pagamento"
						maxLength={255}
						rows={4}
						defaultValue={formaEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={formaEditando?.data_criacao}
					updatedAt={formaEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{formaEditando ? "Atualizar forma de pagamento" : "Salvar forma de pagamento"}
				</Button>
			</form>
		</div>
	);
}
