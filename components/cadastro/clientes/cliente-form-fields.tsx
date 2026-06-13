"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import {
	formatCep,
	formatCpfCnpj,
	formatDateInput,
	formatInscricaoEstadual,
	formatRg,
	formatTelefone,
	onlyDigits,
} from "@/lib/formatters";

type Option = {
	id: string;
	label: string;
};

type ClienteFormFieldsProps = {
	cidadeOptions: Option[];
	condicaoPagamentoOptions: Option[];
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
	xl: "flex flex-col gap-2 md:col-span-8",
};

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

export function ClienteFormFields({
	cidadeOptions,
	condicaoPagamentoOptions,
	action,
	initialData,
	submitLabel = "Salvar cliente",
}: ClienteFormFieldsProps) {
	const [tipo, setTipo] = useState(String(initialData?.tipo ?? "FISICA"));
	const [selectErrors, setSelectErrors] = useState<Record<string, string>>({});
	const [selectedCidadeId, setSelectedCidadeId] = useState(String(initialData?.codcidade ?? ""));
	const dataNascimentoRef = useRef<HTMLInputElement>(null);
	const cpfCnpjRef = useRef<HTMLInputElement>(null);
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
			nextErrors.codcidade = "Selecione a cidade do cliente.";
		}

		setSelectErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			event.preventDefault();
		}
	}

	function handleTipoChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const nextTipo = event.target.value;
		setTipo(nextTipo);

		if (cpfCnpjRef.current) {
			cpfCnpjRef.current.value = formatCpfCnpj(
				cpfCnpjRef.current.value,
				nextTipo === "FISICA" ? 11 : 14
			);
		}
	}

	return (
		<form action={action} onSubmit={validateSearchableSelects} className="space-y-5">
			{initialData?.codcliente ? (
				<input type="hidden" name="codcliente" value={String(initialData.codcliente)} />
			) : null}

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.xs}>
					<Label htmlFor="codcliente-display" className="text-sm text-neutral-800">
						Código:
					</Label>
					<Input
						id="codcliente-display"
						value={String(initialData?.codcliente ?? "")}
						readOnly
						className={readOnlyInputClass}
					/>
				</div>

				<div className={fieldClass.sm}>
					<RequiredLabel htmlFor="tipo" className="text-sm text-neutral-800">
						Tipo:
					</RequiredLabel>
					{isEditing ? <input type="hidden" name="tipo" value={tipo} /> : null}
					<select
						id="tipo"
						name={isEditing ? undefined : "tipo"}
						value={tipo}
						onChange={handleTipoChange}
						disabled={isEditing}
						required
						className={`${inputClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600`}
					>
						<option value="FISICA">Física</option>
						<option value="JURIDICA">Jurídica</option>
					</select>
				</div>

				<div className="flex flex-col gap-2 md:col-span-5">
					<RequiredLabel htmlFor="cliente" className="text-sm text-neutral-800">
						Cliente:
					</RequiredLabel>
					<Input
						id="cliente"
						name="cliente"
						minLength={5}
						maxLength={60}
						required
						placeholder={isFisica ? "Ex: João Silva" : "Ex: Barbearia Central Ltda"}
						defaultValue={String(initialData?.cliente ?? "")}
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
							placeholder={isFisica ? "Ex: João" : "Ex: Central"}
							defaultValue={String(initialData?.apelido ?? "")}
							className={inputClass}
						/>
					</div>

					{isFisica ? (
						<>
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
									<option value="VIUVO">Viúvo(a)</option>
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
										defaultValue={formatDateInput(initialData?.data_nascimento)}
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
						</>
					) : null}

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
						maxLength={60}
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
						<RequiredLabel htmlFor="email" className="text-sm text-neutral-800">
							E-mail:
						</RequiredLabel>
						<Input
							id="email"
							name="email"
							type="email"
							minLength={5}
							maxLength={60}
							required
							placeholder="Ex: cliente@email.com"
							defaultValue={String(initialData?.email ?? "")}
							className={inputClass}
						/>
					</div>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
					<div className={fieldClass.sm}>
						<Label htmlFor="rg-inscricao-estadual" className="text-sm text-neutral-800">
							{isFisica ? "RG:" : "Inscrição Estadual:"}
						</Label>
						<Input
							id="rg-inscricao-estadual"
							name="rg_inscricao_estadual"
							inputMode="numeric"
							pattern={isFisica ? "\\d{2}\\.?\\d{3}\\.?\\d{3}-?\\d?" : "[0-9]{5,14}"}
							minLength={5}
							maxLength={isFisica ? 12 : 14}
							placeholder={isFisica ? "Ex: 00.000.000-0" : "Ex: 123456789"}
							defaultValue={
								isFisica
									? formatRg(String(initialData?.rg_inscricao_estadual ?? ""))
									: formatInscricaoEstadual(String(initialData?.rg_inscricao_estadual ?? ""))
							}
							onInput={
								isFisica
									? (event) => formatInput(event, formatRg)
									: (event) => formatInput(event, formatInscricaoEstadual)
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
							ref={cpfCnpjRef}
							name="cpf_cnpj"
							inputMode="numeric"
							pattern={isFisica ? "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}" : "\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}"}
							minLength={11}
							maxLength={isFisica ? 14 : 18}
							placeholder={isFisica ? "Ex: 000.000.000-00" : "Ex: 00.000.000/0001-00"}
							defaultValue={formatCpfCnpj(String(initialData?.cpf_cnpj ?? ""), isFisica ? 11 : 14)}
							onInput={(event) => formatInput(event, (value) => formatCpfCnpj(value, isFisica ? 11 : 14))}
							className={inputClass}
						/>
					</div>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
					<SearchableSelect
						name="codcondicao_pagamento"
						label="Condição de Pagamento"
						searchLabel="Pesquisar condição por nome"
						searchPlaceholder="Digite o nome da condição"
						selectPlaceholder="Selecione uma condição"
						options={condicaoPagamentoOptions}
						defaultValue={String(initialData?.codcondicao_pagamento ?? "")}
						className="md:col-span-5"
						createHref="/cadastro/condicoes-pagamento?mode=create"
						createLabel="Nova condição"
						error={selectErrors.codcondicao_pagamento}
						onValueChange={() => clearSelectError("codcondicao_pagamento")}
					/>
			</div>

			<div className="flex flex-col gap-2">
					<Label htmlFor="observacoes" className="text-sm text-neutral-800">
						Observações:
					</Label>
					<textarea
						id="observacoes"
						name="observacoes"
						maxLength={110}
						placeholder="Detalhes internos sobre preferências, histórico ou observações do cliente"
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
