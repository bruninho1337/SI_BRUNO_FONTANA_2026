import { deleteFornecedorAction } from "@/app/cadastro/fornecedores/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { formatTelefone } from "@/lib/shared/formatters";
import { listarFornecedoresComCidades } from "@/lib/data/fornecedores";

type FornecedoresListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

function formatDate(value: string | null) {
	if (!value) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export async function FornecedoresListSection({ searchParams }: FornecedoresListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { cidades, fornecedores, error } = await listarFornecedoresComCidades();
	const cidadeMap = new Map((cidades ?? []).map((cidade) => [cidade.codcidade, cidade.cidade]));
	const filtered = (fornecedores ?? []).filter((fornecedor) =>
		[
			fornecedor.codfornecedor,
			fornecedor.fornecedor,
			fornecedor.nome_fantasia,
			fornecedor.contato,
			fornecedor.tipo,
			cidadeMap.get(fornecedor.codcidade),
			fornecedor.telefone,
			fornecedor.email,
			fornecedor.cpf_cnpj,
		].some((value) => String(value ?? "").toLowerCase().includes(query))
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Fornecedores cadastrados"
				count={filtered.length}
				createHref="/cadastro/fornecedores?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por fornecedor, cidade, telefone, e-mail ou documento"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar fornecedores: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Codigo</th>
								<th className="pb-2 font-medium">Fornecedor</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Cidade</th>
								<th className="pb-2 font-medium">Contato</th>
								<th className="pb-2 font-medium">Telefone</th>
								<th className="pb-2 font-medium">E-mail</th>
								<th className="pb-2 font-medium">Criacao</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((fornecedor) => (
								<tr key={fornecedor.codfornecedor} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">
										{fornecedor.codfornecedor}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-900">
										{fornecedor.fornecedor}
										{fornecedor.nome_fantasia ? (
											<span className="block text-xs text-neutral-500">{fornecedor.nome_fantasia}</span>
										) : null}
									</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{fornecedor.tipo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{cidadeMap.get(fornecedor.codcidade) ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{fornecedor.contato ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatTelefone(fornecedor.telefone)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{fornecedor.email}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{formatDate(fornecedor.data_criacao)}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{fornecedor.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/fornecedores?edit=${fornecedor.codfornecedor}`}
											deleteAction={deleteFornecedorAction}
											idName="codfornecedor"
											idValue={fornecedor.codfornecedor}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum fornecedor encontrado.</p>
			)}
		</div>
	);
}
