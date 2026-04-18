import { Suspense } from "react";
import Link from "next/link";

import { createCategoriaAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { CategoryTypeToggle } from "@/components/category-type-toggle";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

type CadastroCategoriasPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroCategoriasPage({
	searchParams,
}: CadastroCategoriasPageProps) {
	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />
				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">Cadastro de Categorias</h1>
								<p className="mt-2 text-sm text-neutral-600">Tela exclusiva para o cadastro de categorias usadas por produtos e serviços.</p>
							</div>
							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>
						<div className="mt-6">
							<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/categorias" />
						</div>
					</div>

					<Suspense fallback={<ProdutosSectionFallback title="Dados da Categoria" />}>
						<CategoriaFormSection searchParams={searchParams} />
					</Suspense>
					<Suspense fallback={<ProdutosSectionFallback title="Categorias cadastradas" />}>
						<CategoriasListSection />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

async function CategoriaFormSection({
	searchParams,
}: {
	searchParams?: Promise<{ success?: string; error?: string }>;
}) {
	const params = await searchParams;

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados da Categoria</h2>
				<p className="mt-1 text-sm text-neutral-500">Cadastre categorias para organizar produtos, serviços ou ambos.</p>
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

			<form action={createCategoriaAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome" className="text-sm text-neutral-800">Nome da Categoria:</Label>
					<Input id="nome" name="nome" type="text" placeholder="Ex: Finalização" className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
				</div>

				<CategoryTypeToggle name="tipo" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">Descrição:</Label>
					<textarea id="descricao" name="descricao" placeholder="Descreva rapidamente a categoria" rows={4} className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring" />
				</div>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar categoria</Button>
			</form>
		</div>
	);
}

async function CategoriasListSection() {
	const supabase = await createClient();
	const { data: categorias, error } = await supabase
		.from("categorias")
		.select("codcategoria, nome, descricao, tipo, ativo")
		.order("nome", { ascending: true });

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Categorias cadastradas</h2>
				<span className="text-sm text-neutral-500">{categorias?.length ?? 0} registro(s)</span>
			</div>

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar categorias: {error.message}</p>
			) : categorias && categorias.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Tipo</th>
								<th className="pb-2 font-medium">Descrição</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{categorias.map((categoria) => (
								<tr key={categoria.codcategoria} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{categoria.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.tipo}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{categoria.descricao ?? "-"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{categoria.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhuma categoria cadastrada no banco ainda.</p>
			)}
		</div>
	);
}

function ProdutosSectionFallback({ title }: { title: string }) {
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
