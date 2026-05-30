import {
	createFuncionarioAction,
	updateFuncionarioAction,
} from "@/app/cadastro/funcionarios/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { MaskedDocumentInput } from "@/components/cadastro/funcionarios/masked-document-input";
import { DatePickerInput } from "@/components/date-picker-input";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { listarFuncoesFuncionariosParaSelecao } from "@/lib/funcoes-funcionarios";
import { buscarFuncionarioPorId } from "@/lib/funcionarios";

type FuncionarioFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = "flex flex-col gap-2";

function formatDateInput(value: string | Date | null | undefined) {
	if (!value) {
		return "";
	}

	if (typeof value === "string") {
		return value.slice(0, 10);
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

export async function FuncionarioFormSection({
	searchParams,
}: FuncionarioFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ data: funcionario }, { data: funcoes, error: funcoesError }] = await Promise.all([
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarFuncionarioPorId(editId),
		listarFuncoesFuncionariosParaSelecao(),
	]);
	const funcaoOptions =
		funcoes?.map((funcao) => ({
			id: String(funcao.codfuncao_funcionario),
			label: funcao.funcao_funcionario,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{funcionario ? "Editar Funcionário" : "Novo Funcionário"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre dados de contato, documentos e regras de pagamento do funcionário.
				</p>
			</div>

			<FormFeedback params={params} />

			{funcoesError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar funcoes: {funcoesError.message}
				</p>
			) : null}

			<form
				action={funcionario ? updateFuncionarioAction : createFuncionarioAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{funcionario ? (
						<input
							type="hidden"
							name="codfuncionario"
							value={funcionario.codfuncionario}
						/>
					) : null}

					<div className={`${fieldClass} md:col-span-2`}>
						<Label htmlFor="codfuncionario-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codfuncionario-display"
							value={funcionario?.codfuncionario ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-5`}>
						<RequiredLabel htmlFor="funcionario" className="text-sm text-neutral-800">
							Funcionário:
						</RequiredLabel>
						<Input
							id="funcionario"
							name="funcionario"
							type="text"
							minLength={5}
							maxLength={80}
							required
							placeholder="Ex: João Silva"
							defaultValue={funcionario?.funcionario ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<Label htmlFor="apelido" className="text-sm text-neutral-800">
							Apelido:
						</Label>
						<Input
							id="apelido"
							name="apelido"
							type="text"
							maxLength={60}
							placeholder="Ex: João"
							defaultValue={funcionario?.apelido ?? ""}
							className={inputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={funcionario?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<SearchableSelect
						name="codfuncao_funcionario"
						label="Função"
						searchLabel="Pesquisar funcao"
						searchPlaceholder="Digite a funcao do funcionario"
						selectPlaceholder="Selecione uma funcao"
						options={funcaoOptions}
						required
						defaultValue={String(funcionario?.codfuncao_funcionario ?? "")}
						className="md:col-span-4"
						createHref="/cadastro/funcoes-funcionarios?mode=create"
						createLabel="Nova funcao"
					/>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="telefone" className="text-sm text-neutral-800">
							Telefone:
						</RequiredLabel>
						<Input
							id="telefone"
							name="telefone"
							type="tel"
							inputMode="tel"
							minLength={10}
							maxLength={15}
							required
							placeholder="Ex: (11) 99999-9999"
							defaultValue={funcionario?.telefone ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-5`}>
						<Label htmlFor="email" className="text-sm text-neutral-800">
							E-mail:
						</Label>
						<Input
							id="email"
							name="email"
							type="email"
							maxLength={80}
							placeholder="Ex: funcionario@email.com"
							defaultValue={funcionario?.email ?? ""}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<DatePickerInput
						id="data_nascimento"
						name="data_nascimento"
						label="Nascimento"
						defaultValue={formatDateInput(funcionario?.data_nascimento)}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>

					<DatePickerInput
						id="data_admissao"
						name="data_admissao"
						label="Admissão"
						required
						defaultValue={formatDateInput(funcionario?.data_admissao) || formatDateInput(new Date())}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>

					<DatePickerInput
						id="data_demissao"
						name="data_demissao"
						label="Demissão"
						defaultValue={formatDateInput(funcionario?.data_demissao)}
						className={`${fieldClass} md:col-span-3`}
						inputClassName={inputClass}
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="salario_base" className="text-sm text-neutral-800">
							Salário base:
						</RequiredLabel>
						<Input
							id="salario_base"
							name="salario_base"
							type="text"
							required
							placeholder="Ex: 2500,00"
							defaultValue={formatDecimalInput(funcionario?.salario_base)}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="percentual_comissao" className="text-sm text-neutral-800">
							Comissão (%):
						</RequiredLabel>
						<Input
							id="percentual_comissao"
							name="percentual_comissao"
							type="text"
							required
							placeholder="Ex: 10"
							defaultValue={formatDecimalInput(funcionario?.percentual_comissao)}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={`${fieldClass} md:col-span-3`}>
						<Label htmlFor="rg" className="text-sm text-neutral-800">
							RG:
						</Label>
						<MaskedDocumentInput
							id="rg"
							name="rg"
							type="text"
							mask="rg"
							inputMode="numeric"
							pattern="\d{2}\.?\d{3}\.?\d{3}-?\d?"
							minLength={5}
							maxLength={12}
							placeholder="Ex: 00.000.000-0"
							defaultValue={funcionario?.rg ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="cpf" className="text-sm text-neutral-800">
							CPF:
						</RequiredLabel>
						<MaskedDocumentInput
							id="cpf"
							name="cpf"
							type="text"
							mask="cpf"
							inputMode="numeric"
							pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
							minLength={11}
							maxLength={14}
							required
							placeholder="Ex: 000.000.000-00"
							defaultValue={funcionario?.cpf ?? ""}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="observacoes" className="text-sm text-neutral-800">
						Observações:
					</Label>
					<textarea
						id="observacoes"
						name="observacoes"
						placeholder="Detalhes internos sobre horarios, especialidades ou pagamento"
						maxLength={255}
						rows={4}
						defaultValue={funcionario?.observacoes ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={funcionario?.data_criacao}
					updatedAt={funcionario?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{funcionario ? "Atualizar funcionario" : "Salvar funcionario"}
				</Button>
			</form>
		</div>
	);
}
