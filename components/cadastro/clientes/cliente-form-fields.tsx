"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { ActiveToggle } from "@/components/active-toggle";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";

type Option = {
	id: string;
	label: string;
};

type ClienteFormFieldsProps = {
	cidadeOptions: Option[];
	action: (formData: FormData) => Promise<void>;
	initialData?: Record<string, string | number | null>;
	submitLabel?: string;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = {
	xs: "flex flex-col gap-2 md:col-span-2",
	sm: "flex flex-col gap-2 md:col-span-3",
	md: "flex flex-col gap-2 md:col-span-4",
	lg: "flex flex-col gap-2 md:col-span-6",
	xl: "flex flex-col gap-2 md:col-span-8",
};

function keepOnlyDigits(event: React.FormEvent<HTMLInputElement>) {
	const input = event.currentTarget;
	input.value = input.value.replace(/\D/g, "");
}

function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

function formatCep(value: string) {
	const digits = onlyDigits(value).slice(0, 8);

	if (digits.length <= 5) {
		return digits;
	}

	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCpfCnpj(value: string) {
	const digits = onlyDigits(value).slice(0, 14);

	if (digits.length <= 11) {
		return digits
			.replace(/^(\d{3})(\d)/, "$1.$2")
			.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
			.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
	}

	return digits
		.replace(/^(\d{2})(\d)/, "$1.$2")
		.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
		.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
		.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatRg(value: string) {
	const digits = onlyDigits(value).slice(0, 9);

	if (digits.length <= 2) {
		return digits;
	}

	if (digits.length <= 5) {
		return `${digits.slice(0, 2)}.${digits.slice(2)}`;
	}

	if (digits.length <= 8) {
		return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
	}

	return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
}

function formatInput(
	event: React.FormEvent<HTMLInputElement>,
	formatter: (value: string) => string
) {
	const input = event.currentTarget;
	input.value = formatter(input.value);
}

export function ClienteFormFields({
	cidadeOptions,
	action,
	initialData,
	submitLabel = "Salvar cliente",
}: ClienteFormFieldsProps) {
	const [tipo, setTipo] = useState(String(initialData?.tipo ?? "FISICA"));
	const dataNascimentoRef = useRef<HTMLInputElement>(null);
	const isEditing = Boolean(initialData?.codcliente);
	const isFisica = tipo === "FISICA";

	function openDatePicker() {
		const input = dataNascimentoRef.current;

		if (!input) {
			return;
		}

		input.showPicker?.();
		input.focus();
	}

	return (
		<form action={action} className="space-y-5">
			<div className="grid gap-4 md:grid-cols-12">
				{initialData?.codcliente ? (
					<>
						<input type="hidden" name="codcliente" value={String(initialData.codcliente)} />
						<div className={fieldClass.xs}>
							<Label htmlFor="codcliente-display" className="text-sm text-neutral-800">
								Codigo:
							</Label>
							<Input
								id="codcliente-display"
								value={String(initialData.codcliente)}
								readOnly
								className={readOnlyInputClass}
							/>
						</div>
					</>
				) : null}

				<ActiveToggle
					name="ativo"
					defaultValue={initialData?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="tipo" className="text-sm text-neutral-800">
						Tipo:
					</RequiredLabel>
					{isEditing ? <input type="hidden" name="tipo" value={tipo} /> : null}
					<select
						id="tipo"
						name={isEditing ? undefined : "tipo"}
						value={tipo}
						onChange={(event) => setTipo(event.target.value)}
						disabled={isEditing}
						required
						className={`${inputClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600`}
					>
						<option value="FISICA">Fisica</option>
						<option value="JURIDICA">Juridica</option>
					</select>
				</div>

				<div className={fieldClass.lg}>
					<RequiredLabel htmlFor="cliente" className="text-sm text-neutral-800">
						Cliente:
					</RequiredLabel>
					<Input id="cliente" name="cliente" minLength={5} maxLength={60} required defaultValue={String(initialData?.cliente ?? "")} className={inputClass} />
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="apelido" className="text-sm text-neutral-800">
						Apelido:
					</Label>
					<Input id="apelido" name="apelido" maxLength={60} defaultValue={String(initialData?.apelido ?? "")} className={inputClass} />
				</div>

				{isFisica ? (
					<div className={fieldClass.sm}>
						<Label htmlFor="estado-civil" className="text-sm text-neutral-800">
							Estado Civil:
						</Label>
						<select id="estado-civil" name="estado_civil" defaultValue={String(initialData?.estado_civil ?? "")} className={inputClass}>
							<option value="">Selecione</option>
							<option value="SOLTEIRO">Solteiro(a)</option>
							<option value="CASADO">Casado(a)</option>
							<option value="SEPARADO">Separado(a)</option>
							<option value="DIVORCIADO">Divorciado(a)</option>
							<option value="VIUVO">Viuvo(a)</option>
							<option value="OUTRO">Outro</option>
						</select>
					</div>
				) : null}

				<div className={fieldClass.xl}>
					<RequiredLabel htmlFor="endereco" className="text-sm text-neutral-800">
						Endereco:
					</RequiredLabel>
					<Input id="endereco" name="endereco" minLength={5} maxLength={60} required defaultValue={String(initialData?.endereco ?? "")} className={inputClass} />
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
						defaultValue={String(initialData?.numero ?? "")}
						onInput={keepOnlyDigits}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.md}>
					<Label htmlFor="complemento" className="text-sm text-neutral-800">
						Complemento:
					</Label>
					<Input id="complemento" name="complemento" maxLength={60} defaultValue={String(initialData?.complemento ?? "")} className={inputClass} />
				</div>

				<div className={fieldClass.md}>
					<RequiredLabel htmlFor="bairro" className="text-sm text-neutral-800">
						Bairro:
					</RequiredLabel>
					<Input id="bairro" name="bairro" minLength={5} maxLength={60} required defaultValue={String(initialData?.bairro ?? "")} className={inputClass} />
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
							defaultValue={formatCep(String(initialData?.cep ?? ""))}
							onInput={(event) => formatInput(event, formatCep)}
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
					className="md:col-span-5"
				/>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="telefone" className="text-sm text-neutral-800">
						Telefone:
					</RequiredLabel>
					<Input
						id="telefone"
						name="telefone"
						inputMode="tel"
						pattern="[0-9]{10,11}"
						minLength={10}
						maxLength={11}
						required
						defaultValue={String(initialData?.telefone ?? "")}
						onInput={keepOnlyDigits}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.lg}>
					<RequiredLabel htmlFor="email" className="text-sm text-neutral-800">
						E-mail:
					</RequiredLabel>
					<Input id="email" name="email" type="email" minLength={5} maxLength={60} required defaultValue={String(initialData?.email ?? "")} className={inputClass} />
				</div>

				{isFisica ? (
					<>
						<div className={fieldClass.sm}>
							<RequiredLabel htmlFor="sexo" className="text-sm text-neutral-800">
								Sexo:
							</RequiredLabel>
							<select
								id="sexo"
								name="sexo"
								defaultValue={String(initialData?.sexo ?? "")}
								required
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
							<Input id="nacionalidade" name="nacionalidade" minLength={5} maxLength={20} defaultValue={String(initialData?.nacionalidade ?? "")} className={inputClass} />
						</div>
					</>
				) : null}

				<div className={fieldClass.sm}>
					<Label htmlFor="data-nascimento" className="text-sm text-neutral-800">
						Data Nascimento:
					</Label>
					<div className="flex gap-2">
						<Input
							ref={dataNascimentoRef}
							id="data-nascimento"
							name="data_nascimento"
							type="date"
							defaultValue={String(initialData?.data_nascimento ?? "")}
							className={inputClass}
						/>
						<button
							type="button"
							aria-label="Selecionar data de nascimento"
							title="Selecionar data"
							onClick={openDatePicker}
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<Calendar className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="rg-inscricao-estadual" className="text-sm text-neutral-800">
						{isFisica ? "RG:" : "Inscricao Estadual:"}
					</Label>
					<Input
						id="rg-inscricao-estadual"
						name="rg_inscricao_estadual"
						inputMode="numeric"
						pattern={isFisica ? "\\d{2}\\.?\\d{3}\\.?\\d{3}-?\\d?" : "[0-9]*"}
						minLength={5}
						maxLength={isFisica ? 12 : 14}
						defaultValue={
							isFisica
								? formatRg(String(initialData?.rg_inscricao_estadual ?? ""))
								: String(initialData?.rg_inscricao_estadual ?? "")
						}
						onInput={
							isFisica
								? (event) => formatInput(event, formatRg)
								: keepOnlyDigits
						}
						className={inputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<Label htmlFor="cpf-cnpj" className="text-sm text-neutral-800">
						{isFisica ? "CPF:" : "CNPJ:"}
					</Label>
					<Input
							id="cpf-cnpj"
							name="cpf_cnpj"
							inputMode="numeric"
							pattern="(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2})?"
							minLength={11}
							maxLength={18}
							defaultValue={formatCpfCnpj(String(initialData?.cpf_cnpj ?? ""))}
							onInput={(event) => formatInput(event, formatCpfCnpj)}
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
					maxLength={255}
					defaultValue={String(initialData?.observacoes ?? "")}
					className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>

			<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
				{submitLabel}
			</Button>
		</form>
	);
}
