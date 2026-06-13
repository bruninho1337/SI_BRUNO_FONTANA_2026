"use client";

import { useRef, useState } from "react";

import { ActiveToggle } from "@/components/forms/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import {
	formatCep,
	formatCpfCnpj,
	formatInscricaoEstadual,
	formatRg,
	formatTelefone,
	onlyDigits,
} from "@/lib/shared/formatters";

type Option = {
	id: string;
	label: string;
};

type FornecedorFormFieldsProps = {
	cidadeOptions: Option[];
	condicaoPagamentoOptions: Option[];
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

export function FornecedorFormFields({
	cidadeOptions,
	condicaoPagamentoOptions,
	action,
	initialData,
	submitLabel = "Salvar fornecedor",
}: FornecedorFormFieldsProps) {
	const [tipo, setTipo] = useState(String(initialData?.tipo ?? "JURIDICA"));
	const [selectErrors, setSelectErrors] = useState<Record<string, string>>({});
	const [selectedCidadeId, setSelectedCidadeId] = useState(String(initialData?.codcidade ?? ""));
	const cpfCnpjRef = useRef<HTMLInputElement>(null);
	const isEditing = Boolean(initialData?.codfornecedor);
	const isFisica = tipo === "FISICA";

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
			nextErrors.codcidade = "Selecione a cidade do fornecedor.";
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
			{initialData?.codfornecedor ? (
				<input type="hidden" name="codfornecedor" value={String(initialData.codfornecedor)} />
			) : null}

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.xs}>
					<Label htmlFor="codfornecedor-display" className="text-sm text-neutral-800">
						Codigo:
					</Label>
					<Input
						id="codfornecedor-display"
						value={String(initialData?.codfornecedor ?? "")}
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
						required
						value={tipo}
						onChange={handleTipoChange}
						disabled={isEditing}
						className={`${inputClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600`}
					>
						<option value="FISICA">Fisica</option>
						<option value="JURIDICA">Juridica</option>
					</select>
				</div>

				<div className="flex flex-col gap-2 md:col-span-5">
					<RequiredLabel htmlFor="fornecedor" className="text-sm text-neutral-800">
						Fornecedor:
					</RequiredLabel>
					<Input
						id="fornecedor"
						name="fornecedor"
						minLength={5}
						maxLength={80}
						required
						placeholder={isFisica ? "Ex: João Silva" : "Ex: Barbearia Central Ltda"}
						defaultValue={String(initialData?.fornecedor ?? "")}
						className={inputClass}
					/>
				</div>

				<ActiveToggle
					name="ativo"
					defaultValue={initialData?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:justify-self-end"
				/>
			</div>

			{!isFisica ? (
				<div className="grid gap-4 md:grid-cols-12">
					<div className={fieldClass.md}>
						<Label htmlFor="nome_fantasia" className="text-sm text-neutral-800">
							Nome Fantasia:
						</Label>
						<Input
							id="nome_fantasia"
							name="nome_fantasia"
							maxLength={80}
							placeholder="Ex: Barbearia Central"
							defaultValue={String(initialData?.nome_fantasia ?? "")}
							className={inputClass}
						/>
					</div>
				</div>
			) : (
				<input type="hidden" name="nome_fantasia" value="" />
			)}

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
					<RequiredLabel htmlFor="email" className="text-sm text-neutral-800">
						E-mail:
					</RequiredLabel>
					<Input
						id="email"
						name="email"
						type="email"
						minLength={5}
						maxLength={80}
						required
						placeholder="Ex: fornecedor@email.com"
						defaultValue={String(initialData?.email ?? "")}
						className={inputClass}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-12">
				<div className={fieldClass.sm}>
					<Label htmlFor="rg_inscricao_estadual" className="text-sm text-neutral-800">
						{isFisica ? "RG:" : "Inscricao Estadual:"}
					</Label>
					<Input
						id="rg_inscricao_estadual"
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
					<Label htmlFor="cpf_cnpj" className="text-sm text-neutral-800">
						{isFisica ? "CPF:" : "CNPJ:"}
					</Label>
					<Input
						id="cpf_cnpj"
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
					Observacoes:
				</Label>
				<textarea
					id="observacoes"
					name="observacoes"
					maxLength={110}
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
