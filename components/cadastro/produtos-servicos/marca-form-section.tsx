import { createMarcaAction, updateMarcaAction } from "@/app/cadastro/produtos-servicos/marcas/actions";
import { ActiveToggle } from "@/components/forms/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarMarcaPorId } from "@/lib/data/marcas";

type MarcaFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";

export async function MarcaFormSection({ searchParams }: MarcaFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: marcaEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarMarcaPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{marcaEditando ? "Editar Marca" : "Nova Marca"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre marcas para organizar produtos por fabricante ou linha.
				</p>
			</div>

			<FormFeedback params={params} />

			<form action={marcaEditando ? updateMarcaAction : createMarcaAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
					{marcaEditando ? (
						<input type="hidden" name="codmarca" value={marcaEditando.codmarca} />
					) : null}

					<div className="flex flex-col gap-2 md:col-span-2">
						<Label htmlFor="codmarca-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codmarca-display"
							value={marcaEditando?.codmarca ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className="flex flex-col gap-2 md:col-span-6">
						<RequiredLabel htmlFor="marca" className="text-sm text-neutral-800">
							Marca:
						</RequiredLabel>
						<Input
							id="marca"
							name="marca"
							type="text"
							minLength={2}
							maxLength={80}
							required
							placeholder="Ex: Don Alcides"
							defaultValue={marcaEditando?.marca ?? ""}
							className={inputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={marcaEditando?.ativo === "N" ? "N" : "S"}
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
						placeholder="Descreva rapidamente a marca"
						maxLength={255}
						rows={4}
						defaultValue={marcaEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={marcaEditando?.data_criacao}
					updatedAt={marcaEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{marcaEditando ? "Atualizar marca" : "Salvar marca"}
				</Button>
			</form>
		</div>
	);
}
