import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CategoriaFormSection } from "@/components/cadastro/produtos-servicos/categoria-form-section";
import { CategoriasListSection } from "@/components/cadastro/produtos-servicos/categorias-list-section";
import { ProdutosServicosTabs } from "@/components/cadastro/produtos-servicos/produtos-servicos-tabs";

type CadastroCategoriasPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default async function CadastroCategoriasPage({ searchParams }: CadastroCategoriasPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return <main className="p-3 sm:p-5" data-cadastro-embedded><CategoriaFormSection searchParams={Promise.resolve(params)} /></main>;
	}
	return (
		<CadastroPageShell
			title="Categorias"
			description="Tela de consulta para a tabela de Categorias."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/categorias" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Categorias cadastradas" />}>
				<CadastroCategoriasContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroCategoriasContent({ searchParams }: CadastroCategoriasPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<CategoriaFormSection searchParams={resolvedSearchParams} />
			) : null}
			<CategoriasListSection searchParams={resolvedSearchParams} />
		</>
	);
}
