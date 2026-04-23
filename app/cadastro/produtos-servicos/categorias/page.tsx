import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CategoriaFormSection } from "@/components/cadastro/produtos-servicos/categoria-form-section";
import { CategoriasListSection } from "@/components/cadastro/produtos-servicos/categorias-list-section";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";

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
		<CadastroPageShell
			title="Cadastro de Categorias"
			description="Tela exclusiva para o cadastro de categorias usadas por produtos e serviços."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/categorias" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados da Categoria" />}>
				<CategoriaFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Categorias cadastradas" />}>
				<CategoriasListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
