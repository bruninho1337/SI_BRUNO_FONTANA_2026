import {
	createContaPagarAction,
	updateContaPagarAction,
} from "@/app/cadastro/contas-pagar/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { DatePickerInput } from "@/components/date-picker-input";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarContaPagarPorId } from "@/lib/contas-pagar";
import { listarFormasPagamentoParaSelecao } from "@/lib/formas-pagamento";
import { listarFornecedoresParaSelecao } from "@/lib/fornecedores";

type ContaPagarFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = "flex flex-col gap-2";
const statusOptions = [
	{ value: "PENDENTE", label: "Pendente" },
	{ value: "PAGO", label: "Pago" },
	{ value: "CANCELADO", label: "Cancelado" },
];

function formatDateInput(value: string | Date | null | undefined) {
	if (!value) {
		return "";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().slice(0, 10);
}

function formatDecimalInput(value: string | number | null | undefined) {
	return String(value ?? 0).replace(".", ",");
}

export async function ContaPagarFormSection({
	searchParams,
}: ContaPagarFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [
		{ data: contaPagar },
		{ data: fornecedores, error: fornecedoresError },
		{ data: formasPagamento, error: formasPagamentoError },
	] = await Promise.all([
		Number.isNaN(editId) ? { data: null } : buscarContaPagarPorId(editId),
		listarFornecedoresParaSelecao(),
		listarFormasPagamentoParaSelecao(),
	]);
	const fornecedorOptions =
		fornecedores?.map((fornecedor) => ({
			id: String(fornecedor.codfornecedor),
			label: fornecedor.fornecedor,
		})) ?? [];
	const formaPagamentoOptions =
		formasPagamento?.map((forma) => ({
			id: String(forma.codforma_pagamento),
			label: `${forma.forma_pagamento} (${forma.tipo})`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{contaPagar ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Registre despesas com fornecedor, vencimento e baixa financeira.
				</p>
			</div>

			<FormFeedback params={params} />

			{fornecedoresError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar fornecedores: {fornecedoresError.message}
				</p>
			) : null}
			{formasPagamentoError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar formas de pagamento: {formasPagamentoError.message}
				</p>
			) : null}

			<form
				action={contaPagar ? updateContaPagarAction : createContaPagarAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{contaPagar ? (
						<input
							type="hidden"
							name="codconta_pagar"
							value={contaPagar.codconta_pagar}
						/>
					) : null}

					<div className={`${fieldClass} md:col-span-2`}>
						<Label htmlFor="codconta-pagar-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codconta-pagar-display"
							value={contaPagar?.codconta_pagar ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-5`}>
						<RequiredLabel htmlFor="conta_pagar" className="text-sm text-neutral-800">
							Conta a Pagar:
						</RequiredLabel>
						<Input
							id="conta_pagar"
							name="conta_pagar"
							type="text"
							minLength={2}
							maxLength={120}
							required
							placeholder="Ex: Aluguel, fornecedor de produtos, energia"
							defaultValue={contaPagar?.conta_pagar ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<Label htmlFor="numero_documento" className="text-sm text-neutral-800">
							Documento:
						</Label>
						<Input
							id="numero_documento"
							name="numero_documento"
							type="text"
							maxLength={60}
							placeholder="Ex: NF 1234, boleto 9988"
							defaultValue={contaPagar?.numero_documento ?? ""}
							className={inputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={contaPagar?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<SearchableSelect
						name="codfornecedor"
						label="Fornecedor"
						searchLabel="Pesquisar fornecedor"
						searchPlaceholder="Digite o nome do fornecedor"
						selectPlaceholder="Selecione um fornecedor"
						options={fornecedorOptions}
						required
						defaultValue={String(contaPagar?.codfornecedor ?? "")}
						className="md:col-span-6"
						createHref="/cadastro/fornecedores?mode=create"
						createLabel="Novo fornecedor"
					/>

					<SearchableSelect
						name="codforma_pagamento"
						label="Forma de pagamento"
						searchLabel="Pesquisar forma"
						searchPlaceholder="Digite a forma de pagamento"
						selectPlaceholder="Selecione uma forma"
						options={formaPagamentoOptions}
						defaultValue={String(contaPagar?.codforma_pagamento ?? "")}
						className="md:col-span-6"
						createHref="/cadastro/formas-pagamento?mode=create"
						createLabel="Nova forma"
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<DatePickerInput
						id="data_emissao"
						name="data_emissao"
						label="Emissão"
						required
						defaultValue={formatDateInput(contaPagar?.data_emissao) || formatDateInput(new Date())}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>

					<DatePickerInput
						id="data_vencimento"
						name="data_vencimento"
						label="Vencimento"
						required
						defaultValue={formatDateInput(contaPagar?.data_vencimento)}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>

					<DatePickerInput
						id="data_pagamento"
						name="data_pagamento"
						label="Pagamento"
						defaultValue={formatDateInput(contaPagar?.data_pagamento)}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="status" className="text-sm text-neutral-800">
							Status:
						</RequiredLabel>
						<select
							id="status"
							name="status"
							required
							defaultValue={contaPagar?.status ?? "PENDENTE"}
							className={inputClass}
						>
							{statusOptions.map((status) => (
								<option key={status.value} value={status.value}>
									{status.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="valor" className="text-sm text-neutral-800">
							Valor:
						</RequiredLabel>
						<Input
							id="valor"
							name="valor"
							type="text"
							required
							placeholder="Ex: 250,00"
							defaultValue={formatDecimalInput(contaPagar?.valor)}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="valor_pago" className="text-sm text-neutral-800">
							Valor pago:
						</RequiredLabel>
						<Input
							id="valor_pago"
							name="valor_pago"
							type="text"
							required
							placeholder="Ex: 0,00"
							defaultValue={formatDecimalInput(contaPagar?.valor_pago)}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="observacoes" className="text-sm text-neutral-800">
						Observacoes:
					</Label>
					<textarea
						id="observacoes"
						name="observacoes"
						placeholder="Detalhes da conta, negociação ou baixa"
						maxLength={255}
						rows={4}
						defaultValue={contaPagar?.observacoes ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={contaPagar?.data_criacao}
					updatedAt={contaPagar?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{contaPagar ? "Atualizar conta" : "Salvar conta"}
				</Button>
			</form>
		</div>
	);
}
