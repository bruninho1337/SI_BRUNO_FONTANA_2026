import Link from "next/link";

import { createEstadoAction } from "@/app/cadastro/localidades/actions";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LocalidadesTabs } from "@/components/localidades-tabs";
import { SearchableSelect } from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

type CadastroEstadosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroEstadosPage({
	searchParams,
}: CadastroEstadosPageProps) {
	const params = await searchParams;
	const supabase = await createClient();

	const [{ data: paises, error: paisesError }, { data: estados, error: estadosError }] =
		await Promise.all([
			supabase.from("paises").select("codpais, pais").order("pais", { ascending: true }),
			supabase
				.from("estados")
				.select("codestado, estado, uf, codpais, ativo")
				.order("estado", { ascending: true }),
		]);

	const paisOptions =
		paises?.map((pais) => ({
			id: String(pais.codpais),
			label: pais.pais,
		})) ?? [];

	const paisMap = new Map(
		(paises ?? []).map((pais) => [pais.codpais, pais.pais])
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
									Cadastro de Estados
								</h1>
								<p className="mt-2 text-sm text-neutral-600">
									Tela exclusiva para a tabela `Estados`, já preparada para
									escolher o país por nome.
								</p>
							</div>

							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>

						<div className="mt-6">
							<LocalidadesTabs currentPath="/cadastro/localidades/estados" />
						</div>
					</div>

					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-neutral-900">
								Dados do Estado
							</h2>
							<p className="mt-1 text-sm text-neutral-500">
								O campo `Código do País` foi substituído por busca + seleção por
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

						{paisesError ? (
							<p className="mb-4 text-sm text-red-600">
								Erro ao carregar países: {paisesError.message}
							</p>
						) : null}

						<form action={createEstadoAction} className="space-y-4">
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

							<div className="flex flex-col gap-2">
								<Label
									htmlFor="nome-estado"
									className="text-sm text-neutral-800"
								>
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

							<SearchableSelect
								name="codpais"
								label="País"
								searchLabel="Pesquisar país por nome"
								searchPlaceholder="Digite o nome do país"
								selectPlaceholder="Selecione um país"
								options={paisOptions}
								required
							/>

							<div className="flex flex-col gap-2">
								<Label
									htmlFor="ativo-estado"
									className="text-sm text-neutral-800"
								>
									Ativo:
								</Label>
								<Input
									id="ativo-estado"
									name="ativo"
									type="text"
									placeholder="Ex: S"
									className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
								/>
							</div>

							<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								Salvar estado
							</Button>
						</form>
					</div>

					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-neutral-900">
								Estados cadastrados
							</h2>
							<span className="text-sm text-neutral-500">
								{estados?.length ?? 0} registro(s)
							</span>
						</div>

						{estadosError ? (
							<p className="text-sm text-red-600">
								Erro ao carregar estados: {estadosError.message}
							</p>
						) : estados && estados.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="min-w-full border-separate border-spacing-y-3">
									<thead>
										<tr className="text-left text-sm text-neutral-500">
											<th className="pb-2 font-medium">UF</th>
											<th className="pb-2 font-medium">Estado</th>
											<th className="pb-2 font-medium">País</th>
											<th className="pb-2 font-medium">Ativo</th>
										</tr>
									</thead>
									<tbody>
										{estados.map((estado) => (
											<tr key={estado.codestado} className="bg-neutral-50">
												<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">
													{estado.uf}
												</td>
												<td className="px-4 py-3 text-sm text-neutral-900">
													{estado.estado}
												</td>
												<td className="px-4 py-3 text-sm text-neutral-700">
													{paisMap.get(estado.codpais) ?? "-"}
												</td>
												<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">
													{estado.ativo}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-sm text-neutral-500">
								Nenhum estado cadastrado no banco ainda.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
