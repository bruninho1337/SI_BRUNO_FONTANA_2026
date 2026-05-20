import { createFornecedorAction, updateFornecedorAction } from "@/app/cadastro/fornecedores/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarFornecedorPorId } from "@/lib/fornecedores";
import { listarCidadesComEstados } from "@/lib/localidades";

type FornecedorFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
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

export async function FornecedorFormSection({ searchParams }: FornecedorFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ cidades, estados, error: cidadesError }, { data: fornecedor }] = await Promise.all([
		listarCidadesComEstados(),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarFornecedorPorId(editId),
	]);
	const estadoMap = new Map(
		(estados ?? []).map((estado) => [estado.codestado, `${estado.estado} - ${estado.uf}`])
	);
	const cidadeOptions =
		cidades?.map((cidade) => ({
			id: String(cidade.codcidade),
			label: `${cidade.cidade}${estadoMap.get(cidade.codest) ? ` - ${estadoMap.get(cidade.codest)}` : ""}`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Preencha os dados comerciais e fiscais do fornecedor.
				</p>
			</div>

			<FormFeedback params={params} />

			{cidadesError ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar cidades: {cidadesError.message}</p>
			) : null}

			<form action={fornecedor ? updateFornecedorAction : createFornecedorAction} className="space-y-5">
				<div className="grid gap-4 md:grid-cols-12">
					{fornecedor?.codfornecedor ? (
						<>
							<input type="hidden" name="codfornecedor" value={String(fornecedor.codfornecedor)} />
							<div className={fieldClass.xs}>
								<Label htmlFor="codfornecedor-display" className="text-sm text-neutral-800">
									Codigo:
								</Label>
								<Input
									id="codfornecedor-display"
									value={String(fornecedor.codfornecedor)}
									readOnly
									className={readOnlyInputClass}
								/>
							</div>
						</>
					) : null}

					<ActiveToggle
						name="ativo"
						defaultValue={fornecedor?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={fieldClass.sm}>
						<RequiredLabel htmlFor="tipo" className="text-sm text-neutral-800">
							Tipo:
						</RequiredLabel>
						<select
							id="tipo"
							name="tipo"
							required
							defaultValue={String(fornecedor?.tipo ?? "JURIDICA")}
							className={inputClass}
						>
							<option value="FISICA">Fisica</option>
							<option value="JURIDICA">Juridica</option>
						</select>
					</div>

					<div className={fieldClass.lg}>
						<RequiredLabel htmlFor="fornecedor" className="text-sm text-neutral-800">
							Fornecedor:
						</RequiredLabel>
						<Input id="fornecedor" name="fornecedor" minLength={5} maxLength={80} required defaultValue={String(fornecedor?.fornecedor ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.sm}>
						<Label htmlFor="nome_fantasia" className="text-sm text-neutral-800">
							Nome Fantasia:
						</Label>
						<Input id="nome_fantasia" name="nome_fantasia" maxLength={80} defaultValue={String(fornecedor?.nome_fantasia ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.sm}>
						<Label htmlFor="contato" className="text-sm text-neutral-800">
							Contato:
						</Label>
						<Input id="contato" name="contato" maxLength={60} defaultValue={String(fornecedor?.contato ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.xl}>
						<RequiredLabel htmlFor="endereco" className="text-sm text-neutral-800">
							Endereco:
						</RequiredLabel>
						<Input id="endereco" name="endereco" minLength={5} maxLength={80} required defaultValue={String(fornecedor?.endereco ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.xs}>
						<RequiredLabel htmlFor="numero" className="text-sm text-neutral-800">
							Numero:
						</RequiredLabel>
						<Input id="numero" name="numero" inputMode="numeric" minLength={1} maxLength={10} required defaultValue={String(fornecedor?.numero ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.md}>
						<Label htmlFor="complemento" className="text-sm text-neutral-800">
							Complemento:
						</Label>
						<Input id="complemento" name="complemento" maxLength={60} defaultValue={String(fornecedor?.complemento ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.md}>
						<RequiredLabel htmlFor="bairro" className="text-sm text-neutral-800">
							Bairro:
						</RequiredLabel>
						<Input id="bairro" name="bairro" minLength={5} maxLength={60} required defaultValue={String(fornecedor?.bairro ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.sm}>
						<RequiredLabel htmlFor="cep" className="text-sm text-neutral-800">
							CEP:
						</RequiredLabel>
						<Input id="cep" name="cep" inputMode="numeric" minLength={8} maxLength={9} required defaultValue={String(fornecedor?.cep ?? "")} className={inputClass} />
					</div>

					<SearchableSelect
						name="codcidade"
						label="Cidade"
						searchLabel="Pesquisar cidade por nome"
						searchPlaceholder="Digite o nome da cidade"
						selectPlaceholder="Selecione uma cidade"
						options={cidadeOptions}
						required
						defaultValue={String(fornecedor?.codcidade ?? "")}
						className="md:col-span-5"
						createHref="/cadastro/localidades/cidades?mode=create"
						createLabel="Nova cidade"
					/>

					<div className={fieldClass.sm}>
						<RequiredLabel htmlFor="telefone" className="text-sm text-neutral-800">
							Telefone:
						</RequiredLabel>
						<Input id="telefone" name="telefone" inputMode="tel" minLength={10} maxLength={11} required defaultValue={String(fornecedor?.telefone ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.lg}>
						<RequiredLabel htmlFor="email" className="text-sm text-neutral-800">
							E-mail:
						</RequiredLabel>
						<Input id="email" name="email" type="email" minLength={5} maxLength={80} required defaultValue={String(fornecedor?.email ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.sm}>
						<Label htmlFor="rg_inscricao_estadual" className="text-sm text-neutral-800">
							RG/Inscricao Estadual:
						</Label>
						<Input id="rg_inscricao_estadual" name="rg_inscricao_estadual" inputMode="numeric" minLength={5} maxLength={14} defaultValue={String(fornecedor?.rg_inscricao_estadual ?? "")} className={inputClass} />
					</div>

					<div className={fieldClass.sm}>
						<Label htmlFor="cpf_cnpj" className="text-sm text-neutral-800">
							CPF/CNPJ:
						</Label>
						<Input id="cpf_cnpj" name="cpf_cnpj" inputMode="numeric" minLength={11} maxLength={18} defaultValue={String(fornecedor?.cpf_cnpj ?? "")} className={inputClass} />
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
						defaultValue={String(fornecedor?.observacoes ?? "")}
						className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{fornecedor ? "Atualizar fornecedor" : "Salvar fornecedor"}
				</Button>
			</form>
		</div>
	);
}
