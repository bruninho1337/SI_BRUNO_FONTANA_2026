import { createCategoriaAction, updateCategoriaAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { CategoryTypeToggle } from "@/components/category-type-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buscarCategoriaPorId } from "@/lib/produtos-servicos";

type CategoriaFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function CategoriaFormSection({ searchParams }: CategoriaFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: categoriaEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarCategoriaPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre categorias para organizar produtos, servicos ou ambos.
				</p>
			</div>

			<FormFeedback params={params} />

			<form action={categoriaEditando ? updateCategoriaAction : createCategoriaAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
				{categoriaEditando ? (
					<>
						<input type="hidden" name="codcategoria" value={categoriaEditando.codcategoria} />
						<div className="flex flex-col gap-2 md:col-span-2">
							<Label htmlFor="codcategoria-display" className="text-sm text-neutral-800">
								Codigo:
							</Label>
							<Input
								id="codcategoria-display"
								value={categoriaEditando.codcategoria}
								readOnly
								className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
							/>
						</div>
					</>
				) : null}

				<div className="flex flex-col gap-2 md:col-span-5">
					<Label htmlFor="nome" className="text-sm text-neutral-800">
						Categoria:
					</Label>
					<Input
						id="nome"
						name="nome"
						type="text"
						placeholder="Ex: Finalizacao"
						defaultValue={categoriaEditando?.nome ?? ""}
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<CategoryTypeToggle
					name="tipo"
					defaultValue={
						categoriaEditando?.tipo === "PRODUTO" || categoriaEditando?.tipo === "SERVICO"
							? categoriaEditando.tipo
							: "AMBOS"
					}
					className="md:col-span-3"
				/>

				<ActiveToggle
					name="ativo"
					defaultValue={categoriaEditando?.ativo === "N" ? "N" : "S"}
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
						placeholder="Descreva rapidamente a categoria"
						rows={4}
						defaultValue={categoriaEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{categoriaEditando ? "Atualizar categoria" : "Salvar categoria"}
				</Button>
			</form>
		</div>
	);
}
