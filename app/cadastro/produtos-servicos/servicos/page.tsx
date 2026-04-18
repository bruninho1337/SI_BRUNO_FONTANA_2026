import { Suspense } from "react";
import Link from "next/link";

import { createServicoAction } from "@/app/cadastro/produtos-servicos/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";
import { SearchableSelect } from "@/components/searchable-select";
import { StorageImageUpload } from "@/components/storage-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

const camposServico = [
	{ id: "valor", label: "Valor", placeholder: "Ex: 35,00", type: "text" },
	{ id: "duracao_minutos", label: "Duração em Minutos", placeholder: "Ex: 45", type: "number" },
	{ id: "valor_desconto", label: "Valor de Desconto", placeholder: "Ex: 5,00", type: "text" },
];

type CadastroServicosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroServicosPage({
	searchParams,
}: CadastroServicosPageProps) {
	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />
				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">Cadastro de Serviços</h1>
								<p className="mt-2 text-sm text-neutral-600">Tela exclusiva para o cadastro de serviços.</p>
							</div>
							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>
						<div className="mt-6">
							<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/servicos" />
						</div>
					</div>
					<Suspense fallback={<ProdutosSectionFallback title="Dados do Serviço" />}>
						<ServicoFormSection searchParams={searchParams} />
					</Suspense>
					<Suspense fallback={<ProdutosSectionFallback title="Serviços cadastrados" />}>
						<ServicosListSection />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

async function ServicoFormSection({
	searchParams,
}: {
	searchParams?: Promise<{ success?: string; error?: string }>;
}) {
	const params = await searchParams;
	const supabase = await createClient();
	const { data: categorias, error: categoriasError } = await supabase
		.from("categorias")
		.select("codcategoria, nome")
		.in("tipo", ["SERVICO", "AMBOS"])
		.eq("ativo", "S")
		.order("nome", { ascending: true });

	const categoriaOptions =
		categorias?.map((categoria) => ({
			id: String(categoria.codcategoria),
			label: categoria.nome,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados do Serviço</h2>
				<p className="mt-1 text-sm text-neutral-500">Preencha os dados do serviço abaixo.</p>
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

			{categoriasError ? (
				<p className="mb-4 text-sm text-red-600">Erro ao carregar categorias: {categoriasError.message}</p>
			) : null}

			<form action={createServicoAction} className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="nome" className="text-sm text-neutral-800">Nome do Serviço:</Label>
					<Input id="nome" name="nome" type="text" placeholder="Ex: Corte social" className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
				</div>

				<SearchableSelect
					name="codcategoria"
					label="Categoria"
					searchLabel="Pesquisar categoria por nome"
					searchPlaceholder="Digite o nome da categoria"
					selectPlaceholder="Selecione uma categoria"
					options={categoriaOptions}
				/>

				{camposServico.map((campo) => (
					<div key={campo.id} className="flex flex-col gap-2">
						<Label htmlFor={campo.id} className="text-sm text-neutral-800">{campo.label}:</Label>
						<Input id={campo.id} name={campo.id} type={campo.type} placeholder={campo.placeholder} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
					</div>
				))}

				<StorageImageUpload name="imagem_url" label="Imagem" folder="servicos" />

				<div className="flex flex-col gap-2">
					<Label htmlFor="descricao" className="text-sm text-neutral-800">Descrição:</Label>
					<textarea id="descricao" name="descricao" placeholder="Descreva rapidamente o servico" rows={4} className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring" />
				</div>

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar serviço</Button>
			</form>
		</div>
	);
}

async function ServicosListSection() {
	const supabase = await createClient();
	const [{ data: categorias }, { data: servicos, error: servicosError }] = await Promise.all([
		supabase.from("categorias").select("codcategoria, nome"),
		supabase
			.from("servicos")
			.select("codservico, nome, codcategoria, duracao_minutos, valor, valor_desconto, imagem_url, ativo")
			.order("nome", { ascending: true }),
	]);

	const categoriaMap = new Map((categorias ?? []).map((categoria) => [categoria.codcategoria, categoria.nome]));

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">Serviços cadastrados</h2>
				<span className="text-sm text-neutral-500">{servicos?.length ?? 0} registro(s)</span>
			</div>

			{servicosError ? (
				<p className="text-sm text-red-600">Erro ao carregar serviços: {servicosError.message}</p>
			) : servicos && servicos.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">Serviço</th>
								<th className="pb-2 font-medium">Categoria</th>
								<th className="pb-2 font-medium">Duração</th>
								<th className="pb-2 font-medium">Valor</th>
								<th className="pb-2 font-medium">Desconto</th>
								<th className="pb-2 font-medium">Imagem</th>
								<th className="pb-2 font-medium">Ativo</th>
							</tr>
						</thead>
						<tbody>
							{servicos.map((servico) => (
								<tr key={servico.codservico} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-900">{servico.nome}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.codcategoria ? categoriaMap.get(servico.codcategoria) ?? "-" : "-"}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.duracao_minutos} min</td>
									<td className="px-4 py-3 text-sm text-neutral-700">R$ {Number(servico.valor).toFixed(2)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">R$ {Number(servico.valor_desconto ?? 0).toFixed(2)}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{servico.imagem_url ? "Sim" : "Nao"}</td>
									<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">{servico.ativo}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum serviço cadastrado no banco ainda.</p>
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
