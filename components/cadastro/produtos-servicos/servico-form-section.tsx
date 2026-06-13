import { createServicoAction, updateServicoAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/forms/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { StorageImageUpload } from "@/components/forms/storage-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarServicoPorId, listarCategoriasPorTipo } from "@/lib/data/produtos-servicos";

type ServicoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function ServicoFormSection({ searchParams }: ServicoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ data: categorias, error }, { data: servicoEditando }] = await Promise.all([
		listarCategoriasPorTipo(["SERVICO", "AMBOS"]),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarServicoPorId(editId),
	]);

	const categoriaOptions =
		categorias?.map((categoria) => ({
			id: String(categoria.codcategoria),
			label: categoria.categoria,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{servicoEditando ? "Editar Servico" : "Novo Servico"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">Preencha os dados do servico abaixo.</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar categorias: {error.message}</p>
			) : null}

			<form action={servicoEditando ? updateServicoAction : createServicoAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
				{servicoEditando ? (
					<>
						<input type="hidden" name="codservico" value={servicoEditando.codservico} />
						<input type="hidden" name="imagem_url" value={servicoEditando.imagem_url ?? ""} />
					</>
				) : null}

				<div className="flex flex-col gap-2 md:col-span-2">
					<Label htmlFor="codservico-display" className="text-sm text-neutral-800">
						Código:
					</Label>
					<Input
						id="codservico-display"
						value={servicoEditando?.codservico ?? ""}
						readOnly
						className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
					/>
				</div>

				<div className="flex flex-col gap-2 md:col-span-5">
					<RequiredLabel htmlFor="servico" className="text-sm text-neutral-800">
						Serviço:
					</RequiredLabel>
					<Input
						id="servico"
						name="servico"
						type="text"
						minLength={2}
						maxLength={80}
						required
						placeholder="Ex: Corte social"
						defaultValue={servicoEditando?.servico ?? ""}
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
					defaultValue={String(servicoEditando?.codcategoria ?? "")}
					className="md:col-span-3"
					createHref="/cadastro/produtos-servicos/categorias?mode=create"
					createLabel="Nova categoria"
				/>

				<ActiveToggle
					name="ativo"
					defaultValue={servicoEditando?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
				/>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className="flex flex-col gap-2 md:col-span-3">
						<RequiredLabel htmlFor="valor" className="text-sm text-neutral-800">
							Valor:
						</RequiredLabel>
						<Input id="valor" name="valor" type="text" required placeholder="Ex: 35,00" defaultValue={String(servicoEditando?.valor ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
					<div className="flex flex-col gap-2 md:col-span-2">
						<RequiredLabel htmlFor="duracao_minutos" className="text-sm text-neutral-800">
							Duração:
						</RequiredLabel>
						<Input id="duracao_minutos" name="duracao_minutos" type="number" required placeholder="Ex: 45 (min)" defaultValue={String(servicoEditando?.duracao_minutos ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
					<div className="flex flex-col gap-2 md:col-span-3">
						<Label htmlFor="valor_desconto" className="text-sm text-neutral-800">
							Desconto:
						</Label>
						<Input id="valor_desconto" name="valor_desconto" type="text" placeholder="Ex: 5,00" defaultValue={String(servicoEditando?.valor_desconto ?? "")} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
				</div>

				<StorageImageUpload name="imagem_arquivo" label="Imagem" folder="servicos" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva rapidamente o servico"
						maxLength={255}
						rows={4}
						defaultValue={servicoEditando?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={servicoEditando?.data_criacao}
					updatedAt={servicoEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{servicoEditando ? "Atualizar servico" : "Salvar servico"}
				</Button>
			</form>
		</div>
	);
}
