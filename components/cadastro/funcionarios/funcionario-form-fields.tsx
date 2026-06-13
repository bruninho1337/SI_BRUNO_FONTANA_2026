"use client";

import { useState } from "react";

import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { DatePickerInput } from "@/components/date-picker-input";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import {
	formatCep,
	formatCpfCnpj,
	formatRg,
	formatTelefone,
	onlyDigits,
} from "@/lib/formatters";

type Option = {
	id: string;
	label: string;
};

type FuncionarioFormFieldsProps = {
	cidadeOptions: Option[];
	funcaoOptions: Option[];
	action: (formData: FormData) => Promise<void>;
	initialData?: Record<string, string | number | Date | null>;
	submitLabel?: string;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = {
	xs: "flex flex-col gap-2 md:col-span-2",
	sm: "flex flex-col gap-2 md:col-span-3",
	md: "flex flex-col gap-2 md:col-span-4",
	lg: "flex flex-col gap-2 md:col-span-6",
};

function formatDateInput(value: string | number | Date | null | undefined) {
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

function formatDecimalInput(value: string | number | Date | null | undefined) {
	return String(value ?? 0).replace(".", ",");
}

function keepOnlyDigits(event: React.FormEvent<HTMLInputElement>) {
	const input = event.currentTarget;
	input.value = onlyDigits(input.value);
}

function formatInput(
	event: React.FormEvent<HTMLInputElement>,
	formatter: (value: string) => string
) {
	const input = event.currentTarget;
	input.value = formatter(input.value);
}

export function FuncionarioFormFields({
	cidadeOptions,
	funcaoOptions,
	action,
	initialData,
	submitLabel = "Salvar funcionario",
}: FuncionarioFormFieldsProps) {
	const [selectErrors, setSelectErrors] = useState<Record<string, string>>({});
	const [selectedCidadeId, setSelectedCidadeId] = useState(String(initialData?.codcidade ?? ""));

	function clearSelectError(name: string) {
		setSelectErrors((current) => {
			if (!current[name]) {
				return current;
			}

			const next = { ...current };
			delete next[name];
			return next;
		});
	}

	function handleCepInput(event: React.FormEvent<HTMLInputElement>) {
		formatInput(event, formatCep);
	}

	function validateSearchableSelects(event: React.FormEvent<HTMLFormElement>) {
		const formData = new FormData(event.currentTarget);
		const nextErrors: Record<string, string> = {};

		if (!String(formData.get("codcidade") ?? "").trim()) {
			nextErrors.codcidade = "Selecione a cidade do funcionario.";
		}

		if (!String(formData.get("codfuncao_funcionario") ?? "").trim()) {
			nextErrors.codfuncao_funcionario = "Selecione a funcao do funcionario.";
		}

		setSelectErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			event.preventDefault();
		}
	}

	return (
		<form action={action} onSubmit={validateSearchableSelects} className="space-y-5">
			{initialData?.codfuncionario ? (
				<input type="hidden" name="codfuncionario" value={String(initialData.codfuncionario)} />
			) : null}

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.xs}>
					<Label htmlFor="codfuncionario-display" className="text-sm text-neutral-800">
						Codigo:
					</Label>
					<Input
						id="codfuncionario-display"
						value={String(initialData?.codfuncionario ?? "")}
						readOnly
						className={readOnlyInputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="tipo-display" className="text-sm text-neutral-800">
						Tipo:
					</RequiredLabel>
					<Input id="tipo-display" value="Fisica" readOnly className={readOnlyInputClass} />
				</div>

				<div className="flex flex-col gap-2 md:col-span-5">
					<RequiredLabel htmlFor="funcionario" className="text-sm text-neutral-800">
						Funcionario:
					</RequiredLabel>
					<Input
						id="funcionario"
						name="funcionario"
						minLength={5}
						maxLength={80}
						required
						placeholder="Ex: João Silva"
						defaultValue={String(initialData?.funcionario ?? "")}
						className={inputClass}
					/>
				</div>

				<ActiveToggle
					name="ativo"
					defaultValue={initialData?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:justify-self-end"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<Label htmlFor="apelido" className="text-sm text-neutral-800">
						Apelido:
					</Label>
					<Input
						id="apelido"
						name="apelido"
						maxLength={60}
						placeholder="Ex: João"
						defaultValue={String(initialData?.apelido ?? "")}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="estado-civil" className="text-sm text-neutral-800">
						Estado Civil:
					</Label>
					<select
						id="estado-civil"
						name="estado_civil"
						defaultValue={String(initialData?.estado_civil ?? "")}
						className={inputClass}
					>
						<option value="">Selecione</option>
						<option value="SOLTEIRO">Solteiro(a)</option>
						<option value="CASADO">Casado(a)</option>
						<option value="SEPARADO">Separado(a)</option>
						<option value="DIVORCIADO">Divorciado(a)</option>
						<option value="VIUVO">Viuvo(a)</option>
						<option value="OUTRO">Outro</option>
					</select>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="sexo" className="text-sm text-neutral-800">
						Sexo:
					</Label>
					<select
						id="sexo"
						name="sexo"
						defaultValue={String(initialData?.sexo ?? "")}
						className={inputClass}
					>
						<option value="">Selecione</option>
						<option value="MASCULINO">Masculino</option>
						<option value="FEMININO">Feminino</option>
					</select>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="nacionalidade" className="text-sm text-neutral-800">
						Nacionalidade:
					</Label>
					<Input
						id="nacionalidade"
						name="nacionalidade"
						minLength={5}
						maxLength={20}
						placeholder="Ex: Brasileira"
						defaultValue={String(initialData?.nacionalidade ?? "")}
						className={inputClass}
					/>
				</div>

				<DatePickerInput
					id="data_nascimento"
					name="data_nascimento"
					label="Nascimento"
					defaultValue={formatDateInput(initialData?.data_nascimento)}
					className={fieldClass.sm}
					inputClassName={inputClass}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.md}>
					<RequiredLabel htmlFor="endereco" className="text-sm text-neutral-800">
						Endereco:
					</RequiredLabel>
					<Input
						id="endereco"
						name="endereco"
						minLength={5}
						maxLength={80}
						required
						placeholder="Ex: Avenida Brasil"
						defaultValue={String(initialData?.endereco ?? "")}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.xs}>
					<RequiredLabel htmlFor="numero" className="text-sm text-neutral-800">
						Numero:
					</RequiredLabel>
					<Input
						id="numero"
						name="numero"
						inputMode="numeric"
						pattern="[0-9]*"
						minLength={1}
						maxLength={10}
						required
						placeholder="Ex: 123"
						defaultValue={String(initialData?.numero ?? "")}
						onInput={keepOnlyDigits}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="cep" className="text-sm text-neutral-800">
						CEP:
					</RequiredLabel>
					<Input
						id="cep"
						name="cep"
						inputMode="numeric"
						pattern="\d{5}-?\d{3}"
						minLength={8}
						maxLength={9}
						required
						placeholder="Ex: 85851-000"
						defaultValue={formatCep(String(initialData?.cep ?? ""))}
						onInput={handleCepInput}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.md}>
					<Label htmlFor="complemento" className="text-sm text-neutral-800">
						Complemento:
					</Label>
					<Input
						id="complemento"
						name="complemento"
						maxLength={60}
						placeholder="Ex: Sala 2"
						defaultValue={String(initialData?.complemento ?? "")}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.md}>
					<RequiredLabel htmlFor="bairro" className="text-sm text-neutral-800">
						Bairro:
					</RequiredLabel>
					<Input
						id="bairro"
						name="bairro"
						minLength={5}
						maxLength={60}
						required
						placeholder="Ex: Centro"
						defaultValue={String(initialData?.bairro ?? "")}
						className={inputClass}
					/>
				</div>

				<SearchableSelect
					name="codcidade"
					label="Cidade"
					searchLabel="Pesquisar cidade por nome"
					searchPlaceholder="Digite o nome da cidade"
					selectPlaceholder="Selecione uma cidade"
					options={cidadeOptions}
					required
					defaultValue={String(initialData?.codcidade ?? "")}
					value={selectedCidadeId}
					className="md:col-span-5"
					createHref="/cadastro/localidades/cidades?mode=create"
					createLabel="Nova cidade"
					error={selectErrors.codcidade}
					onValueChange={(value) => {
						setSelectedCidadeId(value);
						clearSelectError("codcidade");
					}}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="telefone" className="text-sm text-neutral-800">
						Telefone:
					</RequiredLabel>
					<Input
						id="telefone"
						name="telefone"
						inputMode="tel"
						pattern="\(?\d{2}\)?\s?\d{4,5}-?\d{4}"
						minLength={10}
						maxLength={15}
						required
						placeholder="Ex: (45) 99999-9999"
						defaultValue={formatTelefone(String(initialData?.telefone ?? ""))}
						onInput={(event) => formatInput(event, formatTelefone)}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="contato" className="text-sm text-neutral-800">
						Contato:
					</Label>
					<Input
						id="contato"
						name="contato"
						maxLength={60}
						placeholder="Ex: João"
						defaultValue={String(initialData?.contato ?? "")}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.lg}>
					<Label htmlFor="email" className="text-sm text-neutral-800">
						E-mail:
					</Label>
					<Input
						id="email"
						name="email"
						type="email"
						minLength={5}
						maxLength={80}
						placeholder="Ex: funcionario@email.com"
						defaultValue={String(initialData?.email ?? "")}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<Label htmlFor="rg" className="text-sm text-neutral-800">
						RG:
					</Label>
					<Input
						id="rg"
						name="rg"
						inputMode="numeric"
						pattern="\d{2}\.?\d{3}\.?\d{3}-?\d?"
						minLength={5}
						maxLength={12}
						placeholder="Ex: 00.000.000-0"
						defaultValue={formatRg(String(initialData?.rg ?? ""))}
						onInput={(event) => formatInput(event, formatRg)}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="cpf" className="text-sm text-neutral-800">
						CPF:
					</RequiredLabel>
					<Input
						id="cpf"
						name="cpf"
						inputMode="numeric"
						pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
						minLength={11}
						maxLength={14}
						required
						placeholder="Ex: 000.000.000-00"
						defaultValue={formatCpfCnpj(String(initialData?.cpf ?? ""), 11)}
						onInput={(event) => formatInput(event, (value) => formatCpfCnpj(value, 11))}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<SearchableSelect
					name="codfuncao_funcionario"
					label="Funcao"
					searchLabel="Pesquisar funcao"
					searchPlaceholder="Digite a funcao do funcionario"
					selectPlaceholder="Selecione uma funcao"
					options={funcaoOptions}
					required
					defaultValue={String(initialData?.codfuncao_funcionario ?? "")}
					className="md:col-span-4"
					createHref="/cadastro/funcoes-funcionarios?mode=create"
					createLabel="Nova funcao"
					error={selectErrors.codfuncao_funcionario}
					onValueChange={() => clearSelectError("codfuncao_funcionario")}
				/>

				<DatePickerInput
					id="data_admissao"
					name="data_admissao"
					label="Admissao"
					required
					defaultValue={formatDateInput(initialData?.data_admissao) || formatDateInput(new Date())}
					className={fieldClass.sm}
					inputClassName={inputClass}
				/>

				<DatePickerInput
					id="data_demissao"
					name="data_demissao"
					label="Demissao"
					defaultValue={formatDateInput(initialData?.data_demissao)}
					className={fieldClass.sm}
					inputClassName={inputClass}
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="salario_base" className="text-sm text-neutral-800">
						Salario base:
					</RequiredLabel>
					<Input
						id="salario_base"
						name="salario_base"
						required
						placeholder="Ex: 2500,00"
						defaultValue={formatDecimalInput(initialData?.salario_base)}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="percentual_comissao" className="text-sm text-neutral-800">
						Comissao (%):
					</RequiredLabel>
					<Input
						id="percentual_comissao"
						name="percentual_comissao"
						required
						placeholder="Ex: 10"
						defaultValue={formatDecimalInput(initialData?.percentual_comissao)}
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
					maxLength={110}
					placeholder="Detalhes internos sobre horarios, especialidades ou pagamento"
					defaultValue={String(initialData?.observacoes ?? "")}
					className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>

			<AuditDates
				createdAt={initialData?.data_criacao}
				updatedAt={initialData?.data_atualizacao}
			/>

			<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
				{submitLabel}
			</Button>
		</form>
	);
}
