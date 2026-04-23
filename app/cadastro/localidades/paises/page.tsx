import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { PaisFormSection } from "@/components/cadastro/localidades/pais-form-section";
import { PaisesListSection } from "@/components/cadastro/localidades/paises-list-section";
import { LocalidadesTabs } from "@/components/localidades-tabs";

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
		<CadastroPageShell
			title="Cadastro de Países"
			description="Tela exclusiva para a tabela `Paises`."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/paises" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados do País" />}>
				<PaisFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Países cadastrados" />}>
				<PaisesListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
