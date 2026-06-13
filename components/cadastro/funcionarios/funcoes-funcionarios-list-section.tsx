import { deleteFuncaoFuncionarioAction } from "@/app/cadastro/funcoes-funcionarios/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarFuncoesFuncionarios } from "@/lib/data/funcoes-funcionarios";

type FuncoesFuncionariosListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function FuncoesFuncionariosListSection({
	searchParams,
}: FuncoesFuncionariosListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: funcoes, error } = await listarFuncoesFuncionarios();
	const filtered = (funcoes ?? []).filter((funcao) =>
		[funcao.codfuncao_funcionario, funcao.funcao_funcionario, funcao.descricao, funcao.ativo].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Funcoes de funcionarios cadastradas"
				count={filtered.length}
				createHref="/cadastro/funcoes-funcionarios?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por funcao ou descricao"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar funcoes: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Codigo</th>
								<th className="pb-2 font-medium">Funcao</th>
								<th className="pb-2 font-medium">Descricao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((funcao) => (
								<tr key={funcao.codfuncao_funcionario} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">
										{funcao.codfuncao_funcionario}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-900">{funcao.funcao_funcionario}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{funcao.descricao ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{funcao.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/funcoes-funcionarios?edit=${funcao.codfuncao_funcionario}`}
											deleteAction={deleteFuncaoFuncionarioAction}
											idName="codfuncao_funcionario"
											idValue={funcao.codfuncao_funcionario}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma funcao encontrada.</p>
			)}
		</div>
	);
}
