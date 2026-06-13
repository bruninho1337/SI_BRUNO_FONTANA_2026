import { createFornecedorAction, updateFornecedorAction } from "@/app/cadastro/fornecedores/actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { FornecedorFormFields } from "@/components/cadastro/fornecedores/fornecedor-form-fields";
import { buscarFornecedorPorId } from "@/lib/data/fornecedores";
import { listarCidadesComEstados } from "@/lib/data/localidades";

type FornecedorFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function FornecedorFormSection({ searchParams }: FornecedorFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [{ cidades, estados, error: cidadesError }, { data: fornecedor }] = await Promise.all([
		listarCidadesComEstados(),
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarFornecedorPorId(editId),
	]);
	const estadoMap = new Map(
		(estados ?? []).map((estado) => [estado.codestado, `${estado.estado} - ${estado.uf}`])
	);
	const cidadeOptions =
		cidades?.map((cidade) => ({
			id: String(cidade.codcidade),
			label: `${cidade.cidade}${estadoMap.get(cidade.codest) ? ` - ${estadoMap.get(cidade.codest)}` : ""}`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Preencha os dados comerciais e fiscais do fornecedor.
				</p>
			</div>

			<FormFeedback params={params} />

			{cidadesError ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar cidades: {cidadesError.message}</p>
			) : null}

			<FornecedorFormFields
				action={fornecedor ? updateFornecedorAction : createFornecedorAction}
				cidadeOptions={cidadeOptions}
				initialData={fornecedor ?? undefined}
				submitLabel={fornecedor ? "Atualizar fornecedor" : "Salvar fornecedor"}
			/>
		</div>
	);
}
