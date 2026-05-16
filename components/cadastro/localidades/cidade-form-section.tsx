import { createCidadeAction, updateCidadeAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buscarCidadePorId, listarEstadosParaSelecao } from "@/lib/localidades";

type CidadeFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function CidadeFormSection({ searchParams }: CidadeFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ data: estados, error }, { data: cidadeEditando }] = await Promise.all([
		listarEstadosParaSelecao(),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarCidadePorId(editId),
	]);

	const estadoOptions =
		estados?.map((estado) => ({
			id: String(estado.codestado),
			label: `${estado.estado} - ${estado.uf}`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{cidadeEditando ? "Editar Cidade" : "Nova Cidade"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Escolha o estado por busca e selecao por nome.
				</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar estados: {error.message}</p>
			) : null}

			<form action={cidadeEditando ? updateCidadeAction : createCidadeAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
				{cidadeEditando ? (
					<>
						<input type="hidden" name="codcidade" value={cidadeEditando.codcidade} />
						<div className="flex flex-col gap-2 md:col-span-2">
							<Label htmlFor="codcidade-display" className="text-sm text-neutral-800">
								Codigo:
							</Label>
							<Input
								id="codcidade-display"
								value={cidadeEditando.codcidade}
								readOnly
								className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
							/>
						</div>
					</>
				) : null}

				<ActiveToggle
					name="ativo"
					defaultValue={cidadeEditando?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
				/>

				<div className="flex flex-col gap-2 md:col-span-4">
					<Label htmlFor="nome-cidade" className="text-sm text-neutral-800">
						Cidade:
					</Label>
					<Input
						id="nome-cidade"
						name="cidade"
						type="text"
						minLength={2}
						maxLength={100}
						placeholder="Ex: Campinas"
						defaultValue={cidadeEditando?.cidade ?? ""}
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<SearchableSelect
					name="codest"
					label="Estado"
					searchLabel="Pesquisar estado por nome"
					searchPlaceholder="Digite o nome do estado"
					selectPlaceholder="Selecione um estado"
					options={estadoOptions}
					defaultValue={String(cidadeEditando?.codest ?? "")}
					required
					className="md:col-span-5"
				/>
				</div>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{cidadeEditando ? "Atualizar cidade" : "Salvar cidade"}
				</Button>
			</form>
		</div>
	);
}
