import {
	createFuncaoFuncionarioAction,
	updateFuncaoFuncionarioAction,
} from "@/app/cadastro/funcoes-funcionarios/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarFuncaoFuncionarioPorId } from "@/lib/funcoes-funcionarios";

type FuncaoFuncionarioFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = "flex flex-col gap-2";

export async function FuncaoFuncionarioFormSection({
	searchParams,
}: FuncaoFuncionarioFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: funcao } = Number.isNaN(editId)
		? { data: null }
		: await buscarFuncaoFuncionarioPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{funcao ? "Editar Função de Funcionário" : "Nova Função de Funcionário"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre cargos e funções usados no cadastro de funcionários.
				</p>
			</div>

			<FormFeedback params={params} />

			<form
				action={funcao ? updateFuncaoFuncionarioAction : createFuncaoFuncionarioAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{funcao ? (
						<input
							type="hidden"
							name="codfuncao_funcionario"
							value={funcao.codfuncao_funcionario}
						/>
					) : null}

					<div className={`${fieldClass} md:col-span-2`}>
						<Label htmlFor="codfuncao-funcionario-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codfuncao-funcionario-display"
							value={funcao?.codfuncao_funcionario ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-6`}>
						<RequiredLabel htmlFor="funcao_funcionario" className="text-sm text-neutral-800">
							Função:
						</RequiredLabel>
						<Input
							id="funcao_funcionario"
							name="funcao_funcionario"
							type="text"
							minLength={2}
							maxLength={60}
							required
							placeholder="Ex: Barbeiro, Recepcionista"
							defaultValue={funcao?.funcao_funcionario ?? ""}
							className={inputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={funcao?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">
						Descrição:
					</Label>
					<textarea
						id="descricao"
						name="descricao"
						placeholder="Descreva responsabilidades, comissoes ou observacoes da funcao"
						maxLength={255}
						rows={4}
						defaultValue={funcao?.descricao ?? ""}
						className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>

				<AuditDates
					createdAt={funcao?.data_criacao}
					updatedAt={funcao?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{funcao ? "Atualizar funcao" : "Salvar funcao"}
				</Button>
			</form>
		</div>
	);
}
