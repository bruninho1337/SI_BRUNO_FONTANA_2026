import { createCidadeAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarEstadosParaSelecao } from "@/lib/localidades";

type CidadeFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function CidadeFormSection({ searchParams }: CidadeFormSectionProps) {
	const params = await searchParams;
	const { data: estados, error } = await listarEstadosParaSelecao();

	const estadoOptions =
		estados?.map((estado) => ({
			id: String(estado.codestado),
			label: `${estado.estado} - ${estado.uf}`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados da Cidade</h2>
				<p className="mt-1 text-sm text-neutral-500">
					O campo `Código do Estado` foi substituído por busca + seleção por nome.
				</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar estados: {error.message}</p>
			) : null}

			<form action={createCidadeAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome-cidade" className="text-sm text-neutral-800">
						Cidade:
					</Label>
					<Input
						id="nome-cidade"
						name="cidade"
						type="text"
						placeholder="Ex: Campinas"
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
					required
				/>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar cidade
				</Button>
			</form>
		</div>
	);
}
