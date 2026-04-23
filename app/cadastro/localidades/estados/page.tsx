import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { EstadoFormSection } from "@/components/cadastro/localidades/estado-form-section";
import { EstadosListSection } from "@/components/cadastro/localidades/estados-list-section";
import { LocalidadesTabs } from "@/components/localidades-tabs";

type CadastroEstadosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroEstadosPage({
	searchParams,
}: CadastroEstadosPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Estados"
			description="Tela exclusiva para a tabela `Estados`, já preparada para escolher o país por nome."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/estados" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados do Estado" />}>
				<EstadoFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Estados cadastrados" />}>
				<EstadosListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
