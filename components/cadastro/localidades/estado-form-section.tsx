import { createEstadoAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarPaisesParaSelecao } from "@/lib/localidades";

type EstadoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function EstadoFormSection({ searchParams }: EstadoFormSectionProps) {
	const params = await searchParams;
	const { data: paises, error } = await listarPaisesParaSelecao();

	const paisOptions =
		paises?.map((pais) => ({
			id: String(pais.codpais),
			label: pais.pais,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados do Estado</h2>
				<p className="mt-1 text-sm text-neutral-500">
					O campo `Código do País` foi substituído por busca + seleção por nome.
				</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar países: {error.message}</p>
			) : null}

			<form action={createEstadoAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome-estado" className="text-sm text-neutral-800">
						Estado:
					</Label>
					<Input
						id="nome-estado"
						name="estado"
						type="text"
						placeholder="Ex: São Paulo"
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="uf-estado" className="text-sm text-neutral-800">
						UF:
					</Label>
					<Input
						id="uf-estado"
						name="uf"
						type="text"
						placeholder="Ex: SP"
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<SearchableSelect
					name="codpais"
					label="País"
					searchLabel="Pesquisar país por nome"
					searchPlaceholder="Digite o nome do país"
					selectPlaceholder="Selecione um país"
					options={paisOptions}
					required
				/>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar estado
				</Button>
			</form>
		</div>
	);
}
