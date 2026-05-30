import { deleteFuncionarioAction } from "@/app/cadastro/funcionarios/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { formatCpfCnpj, formatTelefone } from "@/lib/formatters";
import { listarFuncionarios } from "@/lib/funcionarios";

type FuncionariosListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatDate(value: string | Date | null | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatCurrency(value: string | number | null | undefined) {
	return Number(value ?? 0).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export async function FuncionariosListSection({
	searchParams,
}: FuncionariosListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { data: funcionarios, error } = await listarFuncionarios();
	const filtered = (funcionarios ?? []).filter((funcionario) =>
		[
			funcionario.codfuncionario,
			funcionario.funcionario,
			funcionario.apelido,
			funcionario.funcao_funcionario,
			funcionario.telefone,
			funcionario.email,
			funcionario.cpf,
			funcionario.rg,
			funcionario.ativo,
		].some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Funcionários cadastrados"
				count={filtered.length}
				createHref="/cadastro/funcionarios?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por funcionário, função, telefone, e-mail ou documento"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar funcionários: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Codigo</th>
								<th className="pb-2 font-medium">Funcionário</th>
								<th className="pb-2 font-medium">Função</th>
								<th className="pb-2 font-medium">Telefone</th>
								<th className="pb-2 font-medium">E-mail</th>
								<th className="pb-2 font-medium">CPF</th>
								<th className="pb-2 font-medium">Admissão</th>
								<th className="pb-2 font-medium">Salário</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Ações</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((funcionario) => (
								<tr key={funcionario.codfuncionario} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">
										{funcionario.codfuncionario}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-900">
										{funcionario.funcionario}
										{funcionario.apelido ? (
											<span className="block text-xs text-neutral-500">{funcionario.apelido}</span>
										) : null}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{funcionario.funcao_funcionario}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatTelefone(funcionario.telefone)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{funcionario.email ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatCpfCnpj(funcionario.cpf, 11)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDate(funcionario.data_admissao)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatCurrency(funcionario.salario_base)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{funcionario.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/funcionarios?edit=${funcionario.codfuncionario}`}
											deleteAction={deleteFuncionarioAction}
											idName="codfuncionario"
											idValue={funcionario.codfuncionario}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum funcionario encontrado.</p>
			)}
		</div>
	);
}
