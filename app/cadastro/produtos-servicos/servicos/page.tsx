import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { ServicoFormSection } from "@/components/cadastro/produtos-servicos/servico-form-section";
import { ServicosListSection } from "@/components/cadastro/produtos-servicos/servicos-list-section";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";

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
		<CadastroPageShell
			title="Cadastro de Serviços"
			description="Tela exclusiva para o cadastro de serviços."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/servicos" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados do Serviço" />}>
				<ServicoFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Serviços cadastrados" />}>
				<ServicosListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
