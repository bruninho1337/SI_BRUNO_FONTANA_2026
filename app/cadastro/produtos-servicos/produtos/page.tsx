import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { ProdutoFormSection } from "@/components/cadastro/produtos-servicos/produto-form-section";
import { ProdutosListSection } from "@/components/cadastro/produtos-servicos/produtos-list-section";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";

type CadastroProdutosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroProdutosPage({ searchParams }: CadastroProdutosPageProps) {
	return (
		<CadastroPageShell
			title="Produtos"
			description="Consulta de produtos por categoria ou descrição."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/produtos" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Produtos cadastrados" />}>
				<CadastroProdutosContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroProdutosContent({ searchParams }: CadastroProdutosPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<ProdutoFormSection searchParams={resolvedSearchParams} />
			) : null}
			<ProdutosListSection searchParams={resolvedSearchParams} />
		</>
	);
}
