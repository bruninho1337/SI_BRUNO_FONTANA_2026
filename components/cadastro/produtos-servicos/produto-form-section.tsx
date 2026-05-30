import { createProdutoAction, updateProdutoAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { StorageImageUpload } from "@/components/storage-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { listarMarcasParaSelecao } from "@/lib/marcas";
import { buscarProdutoPorId, listarCategoriasPorTipo } from "@/lib/produtos-servicos";

type ProdutoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function ProdutoFormSection({ searchParams }: ProdutoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [
		{ data: categorias, error: categoriasError },
		{ data: marcas, error: marcasError },
		{ data: produtoEditando },
	] = await Promise.all([
		listarCategoriasPorTipo(["PRODUTO", "AMBOS"]),
		listarMarcasParaSelecao(),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarProdutoPorId(editId),
	]);

	const categoriaOptions =
		categorias?.map((categoria) => ({
			id: String(categoria.codcategoria),
			label: categoria.nome,
		})) ?? [];

	const marcaOptions =
		marcas?.map((marca) => ({
			id: String(marca.codmarca),
			label: marca.marca,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{produtoEditando ? "Editar Produto" : "Novo Produto"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">Preencha os dados do produto abaixo.</p>
			</div>

			<FormFeedback params={params} />

			{categoriasError ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar categorias: {categoriasError.message}</p>
			) : null}

			{marcasError ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar marcas: {marcasError.message}</p>
			) : null}

			<form action={produtoEditando ? updateProdutoAction : createProdutoAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
				{produtoEditando ? (
					<>
						<input type="hidden" name="codproduto" value={produtoEditando.codproduto} />
						<input type="hidden" name="imagem_url" value={produtoEditando.imagem_url ?? ""} />
					</>
				) : null}

				<div className="flex flex-col gap-2 md:col-span-2">
					<Label htmlFor="codproduto-display" className="text-sm text-neutral-800">
						Código:
					</Label>
					<Input
						id="codproduto-display"
						value={produtoEditando?.codproduto ?? ""}
						readOnly
						className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
					/>
				</div>

				<div className="flex flex-col gap-2 md:col-span-5">
					<RequiredLabel htmlFor="nome" className="text-sm text-neutral-800">
						Produto:
					</RequiredLabel>
					<Input
						id="nome"
						name="nome"
						type="text"
						minLength={2}
						maxLength={80}
						required
						placeholder="Ex: Pomada modeladora"
						defaultValue={produtoEditando?.nome ?? ""}
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
					defaultValue={String(produtoEditando?.codcategoria ?? "")}
					className="md:col-span-3"
					createHref="/cadastro/produtos-servicos/categorias?mode=create"
					createLabel="Nova categoria"
				/>

				<SearchableSelect
					name="codmarca"
					label="Marca"
					searchLabel="Pesquisar marca por nome"
					searchPlaceholder="Digite o nome da marca"
					selectPlaceholder="Selecione uma marca"
					options={marcaOptions}
					defaultValue={String(produtoEditando?.codmarca ?? "")}
					className="md:col-span-3"
					createHref="/cadastro/produtos-servicos/marcas?mode=create"
					createLabel="Nova marca"
				/>

				<ActiveToggle
					name="ativo"
					defaultValue={produtoEditando?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
				/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className="flex flex-col gap-2 md:col-span-3">
						<RequiredLabel htmlFor="valor" className="text-sm text-neutral-800">
							Valor:
						</RequiredLabel>
						<Input id="valor" name="valor" type="text" required placeholder="Ex: 39,90" defaultValue={String(produtoEditando?.valor ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
					<div className="flex flex-col gap-2 md:col-span-2">
						<RequiredLabel htmlFor="quantidade_estoque" className="text-sm text-neutral-800">
							Estoque:
						</RequiredLabel>
						<Input id="quantidade_estoque" name="quantidade_estoque" type="number" required placeholder="Ex: 12" defaultValue={String(produtoEditando?.quantidade_estoque ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
					<div className="flex flex-col gap-2 md:col-span-3">
						<Label htmlFor="valor_desconto" className="text-sm text-neutral-800">
							Desconto:
						</Label>
						<Input id="valor_desconto" name="valor_desconto" type="text" placeholder="Ex: 5,00" defaultValue={String(produtoEditando?.valor_desconto ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
				</div>

				<StorageImageUpload name="imagem_arquivo" label="Imagem" folder="produtos" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva rapidamente o produto"
						maxLength={255}
						rows={4}
						defaultValue={produtoEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={produtoEditando?.data_criacao}
					updatedAt={produtoEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{produtoEditando ? "Atualizar produto" : "Salvar produto"}
				</Button>
			</form>
		</div>
	);
}
