import { createCategoriaAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { CategoryTypeToggle } from "@/components/category-type-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoriaFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function CategoriaFormSection({
	searchParams,
}: CategoriaFormSectionProps) {
	const params = await searchParams;

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados da Categoria</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre categorias para organizar produtos, serviços ou ambos.
				</p>
			</div>

			<FormFeedback params={params} />

			<form action={createCategoriaAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome" className="text-sm text-neutral-800">
						Categoria:
					</Label>
					<Input
						id="nome"
						name="nome"
						type="text"
						placeholder="Ex: Finalização"
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<CategoryTypeToggle name="tipo" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva rapidamente a categoria"
						rows={4}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar categoria
				</Button>
			</form>
		</div>
	);
}
