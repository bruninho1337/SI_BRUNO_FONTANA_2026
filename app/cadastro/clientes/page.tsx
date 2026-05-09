import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { ClienteFormSection } from "@/components/cadastro/clientes/cliente-form-section";
import { ClientesListSection } from "@/components/cadastro/clientes/clientes-list-section";

type CadastroClientesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
	}>;
};

export default async function CadastroClientesPage({
	searchParams,
}: CadastroClientesPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Clientes"
			description="Cadastre clientes fisicos ou juridicos com cidade, contato e status."
			tabs={null}
		>
			<Suspense fallback={<CadastroSectionFallback title="Dados do Cliente" />}>
				<ClienteFormSection searchParams={searchParams} />
			</Suspense>
			<Suspense fallback={<CadastroSectionFallback title="Clientes cadastrados" />}>
				<ClientesListSection />
			</Suspense>
		</CadastroPageShell>
	);
}
