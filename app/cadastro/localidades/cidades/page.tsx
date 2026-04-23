import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CidadeFormSection } from "@/components/cadastro/localidades/cidade-form-section";
import { CidadesListSection } from "@/components/cadastro/localidades/cidades-list-section";
import { LocalidadesTabs } from "@/components/localidades-tabs";

type CadastroCidadesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroCidadesPage({
	searchParams,
}: CadastroCidadesPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Cidades"
			description="Tela exclusiva para a tabela `Cidades`, com busca de estado por nome."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/cidades" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados da Cidade" />}>
				<CidadeFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Cidades cadastradas" />}>
				<CidadesListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
