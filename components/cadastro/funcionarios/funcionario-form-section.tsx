import {
	createFuncionarioAction,
	updateFuncionarioAction,
} from "@/app/cadastro/funcionarios/actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { FuncionarioFormFields } from "@/components/cadastro/funcionarios/funcionario-form-fields";
import { listarFuncoesFuncionariosParaSelecao } from "@/lib/data/funcoes-funcionarios";
import { buscarFuncionarioPorId } from "@/lib/data/funcionarios";
import { listarCidadesComEstados } from "@/lib/data/localidades";

type FuncionarioFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function FuncionarioFormSection({
	searchParams,
}: FuncionarioFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [
		{ data: funcionario },
		{ data: funcoes, error: funcoesError },
		{ cidades, estados, error: cidadesError },
	] = await Promise.all([
		Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarFuncionarioPorId(editId),
		listarFuncoesFuncionariosParaSelecao(),
		listarCidadesComEstados(),
	]);
	const funcaoOptions =
		funcoes?.map((funcao) => ({
			id: String(funcao.codfuncao_funcionario),
			label: funcao.funcao_funcionario,
		})) ?? [];
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
					{funcionario ? "Editar Funcionario" : "Novo Funcionario"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Preencha os dados pessoais, endereco, contato e dados profissionais.
				</p>
			</div>

			<FormFeedback params={params} />

			{funcoesError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar funcoes: {funcoesError.message}
				</p>
			) : null}

			{cidadesError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar cidades: {cidadesError.message}
				</p>
			) : null}

			<FuncionarioFormFields
				action={funcionario ? updateFuncionarioAction : createFuncionarioAction}
				cidadeOptions={cidadeOptions}
				funcaoOptions={funcaoOptions}
				initialData={funcionario ?? undefined}
				submitLabel={funcionario ? "Atualizar funcionario" : "Salvar funcionario"}
			/>
		</div>
	);
}
