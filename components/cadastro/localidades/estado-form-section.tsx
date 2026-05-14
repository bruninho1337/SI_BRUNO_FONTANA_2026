import { createEstadoAction, updateEstadoAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buscarEstadoPorId, listarPaisesParaSelecao } from "@/lib/localidades";

type EstadoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function EstadoFormSection({ searchParams }: EstadoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ data: paises, error }, { data: estadoEditando }] = await Promise.all([
		listarPaisesParaSelecao(),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarEstadoPorId(editId),
	]);

	const paisOptions =
		paises?.map((pais) => ({
			id: String(pais.codpais),
			label: pais.pais,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{estadoEditando ? "Editar Estado" : "Novo Estado"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Escolha o pais por busca e selecao por nome.
				</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar paises: {error.message}</p>
			) : null}

			<form action={estadoEditando ? updateEstadoAction : createEstadoAction} className="space-y-4">
				{estadoEditando ? (
					<>
						<input type="hidden" name="codestado" value={estadoEditando.codestado} />
						<div className="flex flex-col gap-2">
							<Label htmlFor="codestado-display" className="text-sm text-neutral-800">
								Codigo:
							</Label>
							<Input
								id="codestado-display"
								value={estadoEditando.codestado}
								readOnly
								className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
							/>
						</div>
					</>
				) : null}

				<div className="flex flex-col gap-2">
					<Label htmlFor="nome-estado" className="text-sm text-neutral-800">
						Estado:
					</Label>
					<Input
						id="nome-estado"
						name="estado"
						type="text"
						placeholder="Ex: Sao Paulo"
						defaultValue={estadoEditando?.estado ?? ""}
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
						defaultValue={estadoEditando?.uf ?? ""}
						className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>
				</div>

				<SearchableSelect
					name="codpais"
					label="Pais"
					searchLabel="Pesquisar pais por nome"
					searchPlaceholder="Digite o nome do pais"
					selectPlaceholder="Selecione um pais"
					options={paisOptions}
					defaultValue={String(estadoEditando?.codpais ?? "")}
					required
				/>

				<ActiveToggle name="ativo" defaultValue={estadoEditando?.ativo === "N" ? "N" : "S"} />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{estadoEditando ? "Atualizar estado" : "Salvar estado"}
				</Button>
			</form>
		</div>
	);
}
