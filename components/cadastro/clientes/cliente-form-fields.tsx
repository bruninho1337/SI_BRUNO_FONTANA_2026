"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { ActiveToggle } from "@/components/active-toggle";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function keepOnlyDigits(event: React.FormEvent<HTMLInputElement>) {
	const input = event.currentTarget;
	input.value = input.value.replace(/\D/g, "");
}

export function ClienteFormFields({
	cidadeOptions,
	action,
	initialData,
	submitLabel = "Salvar cliente",
}: ClienteFormFieldsProps) {
	const [tipo, setTipo] = useState(String(initialData?.tipo ?? "FISICA"));
	const dataNascimentoRef = useRef<HTMLInputElement>(null);
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
			{initialData?.codcliente ? (
				<>
					<input type="hidden" name="codcliente" value={String(initialData.codcliente)} />
					<div className="flex flex-col gap-2">
						<Label htmlFor="codcliente-display" className="text-sm text-neutral-800">
							Codigo:
						</Label>
						<Input
							id="codcliente-display"
							value={String(initialData.codcliente)}
							readOnly
							className="h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
						/>
					</div>
				</>
			) : null}
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<Label htmlFor="tipo" className="text-sm text-neutral-800">
						Tipo:
					</Label>
					<select
						id="tipo"
						name="tipo"
						value={tipo}
						onChange={(event) => setTipo(event.target.value)}
						required
						className={inputClass}
					>
						<option value="FISICA">Fisica</option>
						<option value="JURIDICA">Juridica</option>
					</select>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="cliente" className="text-sm text-neutral-800">
						Cliente:
					</Label>
					<Input id="cliente" name="cliente" minLength={5} maxLength={60} required defaultValue={String(initialData?.cliente ?? "")} className={inputClass} />
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="apelido" className="text-sm text-neutral-800">
						Apelido:
					</Label>
					<Input id="apelido" name="apelido" maxLength={60} defaultValue={String(initialData?.apelido ?? "")} className={inputClass} />
				</div>

				{isFisica ? (
					<div className="flex flex-col gap-2">
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

				<div className="flex flex-col gap-2">
					<Label htmlFor="endereco" className="text-sm text-neutral-800">
						Endereco:
					</Label>
					<Input id="endereco" name="endereco" minLength={5} maxLength={60} required defaultValue={String(initialData?.endereco ?? "")} className={inputClass} />
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="numero" className="text-sm text-neutral-800">
						Numero:
					</Label>
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

				<div className="flex flex-col gap-2">
					<Label htmlFor="complemento" className="text-sm text-neutral-800">
						Complemento:
					</Label>
					<Input id="complemento" name="complemento" maxLength={60} defaultValue={String(initialData?.complemento ?? "")} className={inputClass} />
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="bairro" className="text-sm text-neutral-800">
						Bairro:
					</Label>
					<Input id="bairro" name="bairro" minLength={5} maxLength={60} required defaultValue={String(initialData?.bairro ?? "")} className={inputClass} />
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="cep" className="text-sm text-neutral-800">
						CEP:
					</Label>
					<Input
						id="cep"
						name="cep"
						inputMode="numeric"
						pattern="[0-9]{8}"
						minLength={8}
						maxLength={8}
						required
						defaultValue={String(initialData?.cep ?? "")}
						onInput={keepOnlyDigits}
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
				/>

				<div className="flex flex-col gap-2">
					<Label htmlFor="telefone" className="text-sm text-neutral-800">
						Telefone:
					</Label>
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

				<div className="flex flex-col gap-2">
					<Label htmlFor="email" className="text-sm text-neutral-800">
						E-mail:
					</Label>
					<Input id="email" name="email" type="email" minLength={5} maxLength={60} required defaultValue={String(initialData?.email ?? "")} className={inputClass} />
				</div>

				{isFisica ? (
					<>
						<div className="flex flex-col gap-2">
							<Label htmlFor="sexo" className="text-sm text-neutral-800">
								Sexo:
							</Label>
							<select id="sexo" name="sexo" defaultValue={String(initialData?.sexo ?? "")} className={inputClass}>
								<option value="">Selecione</option>
								<option value="MASCULINO">Masculino</option>
								<option value="FEMININO">Feminino</option>
							</select>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="nacionalidade" className="text-sm text-neutral-800">
								Nacionalidade:
							</Label>
							<Input id="nacionalidade" name="nacionalidade" minLength={5} maxLength={20} defaultValue={String(initialData?.nacionalidade ?? "")} className={inputClass} />
						</div>
					</>
				) : null}

				<div className="flex flex-col gap-2">
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

				<div className="flex flex-col gap-2">
					<Label htmlFor="rg-inscricao-estadual" className="text-sm text-neutral-800">
						{isFisica ? "RG:" : "Inscricao Estadual:"}
					</Label>
					<Input
						id="rg-inscricao-estadual"
						name="rg_inscricao_estadual"
						inputMode="numeric"
						pattern="[0-9]*"
						minLength={5}
						maxLength={14}
						defaultValue={String(initialData?.rg_inscricao_estadual ?? "")}
						onInput={keepOnlyDigits}
						className={inputClass}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="cpf-cnpj" className="text-sm text-neutral-800">
						{isFisica ? "CPF:" : "CNPJ:"}
					</Label>
					<Input
						id="cpf-cnpj"
						name="cpf_cnpj"
						inputMode="numeric"
						pattern="([0-9]{11}|[0-9]{14})?"
						minLength={11}
						maxLength={14}
						defaultValue={String(initialData?.cpf_cnpj ?? "")}
						onInput={keepOnlyDigits}
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

			<ActiveToggle name="ativo" defaultValue={initialData?.ativo === "N" ? "N" : "S"} />

			<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
				{submitLabel}
			</Button>
		</form>
	);
}
