import Link from "next/link";

import { createCidadeAction } from "@/app/cadastro/localidades/actions";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LocalidadesTabs } from "@/components/localidades-tabs";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

type CadastroCidadesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroCidadesPage({
	searchParams,
}: CadastroCidadesPageProps) {
	const params = await searchParams;
	const supabase = await createClient();
	const [{ data: estados, error: estadosError }, { data: cidades, error: cidadesError }] =
		await Promise.all([
			supabase
				.from("estados")
				.select("codestado, estado, uf")
				.order("estado", { ascending: true }),
			supabase
				.from("cidades")
				.select("codcidade, cidade, codest, ativo")
				.order("cidade", { ascending: true }),
		]);

	const estadoOptions =
		estados?.map((estado) => ({
			id: String(estado.codestado),
			label: `${estado.estado} - ${estado.uf}`,
		})) ?? [];

	const estadoMap = new Map(
		(estados ?? []).map((estado) => [estado.codestado, `${estado.estado} - ${estado.uf}`])
	);

	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />

				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">
									Cadastro de Cidades
								</h1>
								<p className="mt-2 text-sm text-neutral-600">
									Tela exclusiva para a tabela `Cidades`, com busca de estado por
									nome.
								</p>
							</div>

							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>

						<div className="mt-6">
							<LocalidadesTabs currentPath="/cadastro/localidades/cidades" />
						</div>
					</div>

					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-neutral-900">
								Dados da Cidade
							</h2>
							<p className="mt-1 text-sm text-neutral-500">
								O campo `Código do Estado` foi substituído por busca + seleção por
								nome.
							</p>
						</div>

						{params?.success ? (
							<div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
								{params.success}
							</div>
						) : null}

						{params?.error ? (
							<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{params.error}
							</div>
						) : null}

						{estadosError ? (
							<p className="mb-4 text-sm text-red-600">
								Erro ao carregar estados: {estadosError.message}
							</p>
						) : null}

						<form action={createCidadeAction} className="space-y-4">
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="nome-cidade"
									className="text-sm text-neutral-800"
								>
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

							<div className="flex flex-col gap-2">
								<Label
									htmlFor="ativo-cidade"
									className="text-sm text-neutral-800"
								>
									Ativo:
								</Label>
								<Input
									id="ativo-cidade"
									name="ativo"
									type="text"
									placeholder="Ex: S"
									className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
								/>
							</div>

							<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								Salvar cidade
							</Button>
						</form>
					</div>

					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-neutral-900">
								Cidades cadastradas
							</h2>
							<span className="text-sm text-neutral-500">
								{cidades?.length ?? 0} registro(s)
							</span>
						</div>

						{cidadesError ? (
							<p className="text-sm text-red-600">
								Erro ao carregar cidades: {cidadesError.message}
							</p>
						) : cidades && cidades.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="min-w-full border-separate border-spacing-y-3">
									<thead>
										<tr className="text-left text-sm text-neutral-500">
											<th className="pb-2 font-medium">Cidade</th>
											<th className="pb-2 font-medium">Estado</th>
											<th className="pb-2 font-medium">Ativo</th>
										</tr>
									</thead>
									<tbody>
										{cidades.map((cidade) => (
											<tr key={cidade.codcidade} className="bg-neutral-50">
												<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">
													{cidade.cidade}
												</td>
												<td className="px-4 py-3 text-sm text-neutral-700">
													{estadoMap.get(cidade.codest) ?? "-"}
												</td>
												<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">
													{cidade.ativo}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-sm text-neutral-500">
								Nenhuma cidade cadastrada no banco ainda.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
