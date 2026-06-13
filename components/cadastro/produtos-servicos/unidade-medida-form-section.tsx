import {
	createUnidadeMedidaAction,
	updateUnidadeMedidaAction,
} from "@/app/cadastro/produtos-servicos/unidades-medida/actions";
import { ActiveToggle } from "@/components/forms/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarUnidadeMedidaPorId } from "@/lib/data/unidades-medida";

type UnidadeMedidaFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";

export async function UnidadeMedidaFormSection({
	searchParams,
}: UnidadeMedidaFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: unidadeEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarUnidadeMedidaPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{unidadeEditando ? "Editar Unidade de Medida" : "Nova Unidade de Medida"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre unidades usadas no estoque e na venda de produtos.
				</p>
			</div>

			<FormFeedback params={params} />

			<form
				action={unidadeEditando ? updateUnidadeMedidaAction : createUnidadeMedidaAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{unidadeEditando ? (
						<input
							type="hidden"
							name="codunidade_medida"
							value={unidadeEditando.codunidade_medida}
						/>
					) : null}

					<div className="flex flex-col gap-2 md:col-span-2">
						<Label htmlFor="codunidade-medida-display" className="text-sm text-neutral-800">
							Codigo:
						</Label>
						<Input
							id="codunidade-medida-display"
							value={unidadeEditando?.codunidade_medida ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className="flex flex-col gap-2 md:col-span-5">
						<RequiredLabel htmlFor="unidade_medida" className="text-sm text-neutral-800">
							Unidade de Medida:
						</RequiredLabel>
						<Input
							id="unidade_medida"
							name="unidade_medida"
							type="text"
							minLength={2}
							maxLength={80}
							required
							placeholder="Ex: Unidade"
							defaultValue={unidadeEditando?.unidade_medida ?? ""}
							className={inputClass}
						/>
					</div>

					<div className="flex flex-col gap-2 md:col-span-2">
						<RequiredLabel htmlFor="sigla" className="text-sm text-neutral-800">
							Sigla:
						</RequiredLabel>
						<Input
							id="sigla"
							name="sigla"
							type="text"
							minLength={1}
							maxLength={10}
							required
							placeholder="Ex: UN"
							defaultValue={unidadeEditando?.sigla ?? ""}
							className={inputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={unidadeEditando?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descricao:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva rapidamente a unidade de medida"
						maxLength={255}
						rows={4}
						defaultValue={unidadeEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={unidadeEditando?.data_criacao}
					updatedAt={unidadeEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{unidadeEditando ? "Atualizar unidade de medida" : "Salvar unidade de medida"}
				</Button>
			</form>
		</div>
	);
}
