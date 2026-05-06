import { createProdutoAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { StorageImageUpload } from "@/components/storage-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarCategoriasPorTipo } from "@/lib/produtos-servicos";

const camposProduto = [
	{ id: "valor", label: "Valor", placeholder: "Ex: 39,90", type: "text" },
	{
		id: "quantidade_estoque",
		label: "Quantidade em Estoque",
		placeholder: "Ex: 12",
		type: "number",
	},
	{
		id: "valor_desconto",
		label: "Valor de Desconto",
		placeholder: "Ex: 5,00",
		type: "text",
	},
];

type ProdutoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function ProdutoFormSection({ searchParams }: ProdutoFormSectionProps) {
	const params = await searchParams;
	const { data: categorias, error } = await listarCategoriasPorTipo(["PRODUTO", "AMBOS"]);

	const categoriaOptions =
		categorias?.map((categoria) => ({
			id: String(categoria.codcategoria),
			label: categoria.nome,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados do Produto</h2>
				<p className="mt-1 text-sm text-neutral-500">Preencha os dados do produto abaixo.</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar categorias: {error.message}</p>
			) : null}

			<form action={createProdutoAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome" className="text-sm text-neutral-800">
						Produto:
					</Label>
					<Input
						id="nome"
						name="nome"
						type="text"
						placeholder="Ex: Pomada modeladora"
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<SearchableSelect
					name="codcategoria"
					label="Categoria"
					searchLabel="Pesquisar categoria por nome"
					searchPlaceholder="Digite o nome da categoria"
					selectPlaceholder="Selecione uma categoria"
					options={categoriaOptions}
				/>

				{camposProduto.map((campo) => (
					<div key={campo.id} className="flex flex-col gap-2">
						<Label htmlFor={campo.id} className="text-sm text-neutral-800">
							{campo.label}:
						</Label>
						<Input
							id={campo.id}
							name={campo.id}
							type={campo.type}
							placeholder={campo.placeholder}
							className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
						/>
					</div>
				))}

				<StorageImageUpload name="imagem_arquivo" label="Imagem" folder="produtos" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva rapidamente o produto"
						rows={4}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar produto
				</Button>
			</form>
		</div>
	);
}
