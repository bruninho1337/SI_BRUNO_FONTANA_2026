import { Suspense } from "react";
import Link from "next/link";

import { createPaisAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LocalidadesTabs } from "@/components/localidades-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

const camposPais = [
	{
		id: "pais",
		label: "Nome do País",
		placeholder: "Ex: Brasil",
		type: "text",
	},
	{
		id: "sigla-pais",
		label: "Sigla",
		placeholder: "Ex: BR",
		type: "text",
	},
	{
		id: "ddi-pais",
		label: "DDI",
		placeholder: "Ex: 55",
		type: "text",
	},
	{
		id: "moeda-pais",
		label: "Moeda",
		placeholder: "Ex: BRL",
		type: "text",
	},
];

type CadastroPaisesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroPaisesPage({
	searchParams,
}: CadastroPaisesPageProps) {
	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />

				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">
									Cadastro de Países
								</h1>
								<p className="mt-2 text-sm text-neutral-600">
									Tela exclusiva para a tabela `Paises`.
								</p>
							</div>

							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>

						<div className="mt-6">
							<LocalidadesTabs currentPath="/cadastro/localidades/paises" />
						</div>
					</div>

					<Suspense fallback={<LocalidadesSectionFallback title="Dados do País" />}>
						<PaisFormSection searchParams={searchParams} />
					</Suspense>
					<Suspense fallback={<LocalidadesSectionFallback title="Países cadastrados" />}>
						<PaisesListSection />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

async function PaisFormSection({
	searchParams,
}: {
	searchParams?: Promise<{ success?: string; error?: string }>;
}) {
	const params = await searchParams;

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados do País</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Os campos automáticos do banco permanecem fora do formulário.
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

			<form action={createPaisAction} className="space-y-4">
				{camposPais.map((campo) => (
					<div key={campo.id} className="flex flex-col gap-2">
						<Label htmlFor={campo.id} className="text-sm text-neutral-800">
							{campo.label}:
						</Label>
						<Input
							id={campo.id}
							name={campo.id.replace("-pais", "")}
							type={campo.type}
							placeholder={campo.placeholder}
							className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
						/>
					</div>
				))}

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar país
				</Button>
			</form>
		</div>
	);
}

async function PaisesListSection() {
	const supabase = await createClient();
	const { data: paises, error } = await supabase
		.from("paises")
		.select("codpais, pais, sigla, ddi, moeda, ativo")
		.order("pais", { ascending: true });

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Países cadastrados</h2>
				<span className="text-sm text-neutral-500">{paises?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar países: {error.message}</p>
			) : paises && paises.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">País</th>
								<th className="pb-2 font-medium">Sigla</th>
								<th className="pb-2 font-medium">DDI</th>
								<th className="pb-2 font-medium">Moeda</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{paises.map((pais) => (
								<tr key={pais.codpais} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{pais.pais}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.sigla ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.ddi ?? "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{pais.moeda ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{pais.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum país cadastrado no banco ainda.</p>
			)}
		</div>
	);
}

function LocalidadesSectionFallback({ title }: { title: string }) {
	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
				<span className="text-sm text-neutral-400">Carregando...</span>
			</div>
			<div className="space-y-3">
				<div className="h-12 rounded-xl bg-neutral-100" />
				<div className="h-12 rounded-xl bg-neutral-100" />
				<div className="h-12 rounded-xl bg-neutral-100" />
			</div>
		</div>
	);
}
