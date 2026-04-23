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
	}>;
};

export default async function CadastroProdutosPage({
	searchParams,
}: CadastroProdutosPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Produtos"
			description="Tela exclusiva para o cadastro de produtos."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/produtos" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados do Produto" />}>
				<ProdutoFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Produtos cadastrados" />}>
				<ProdutosListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
