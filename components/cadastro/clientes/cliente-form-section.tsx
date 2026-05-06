import { createClienteAction } from "@/app/cadastro/clientes/actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { ClienteFormFields } from "@/components/cadastro/clientes/cliente-form-fields";
import { listarCidadesComEstados } from "@/lib/localidades";

type ClienteFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function ClienteFormSection({ searchParams }: ClienteFormSectionProps) {
	const params = await searchParams;
	const { cidades, estados, error } = await listarCidadesComEstados();
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
				<h2 className="text-xl font-semibold text-neutral-900">Dados do Cliente</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Preencha os dados do cliente abaixo.
				</p>
			</div>

			<FormFeedback params={params} />

			{error ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar cidades: {error.message}</p>
			) : null}

			<ClienteFormFields action={createClienteAction} cidadeOptions={cidadeOptions} />
		</div>
	);
}
