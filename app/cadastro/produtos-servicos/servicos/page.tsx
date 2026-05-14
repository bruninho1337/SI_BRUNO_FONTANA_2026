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
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroServicosPage({ searchParams }: CadastroServicosPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Servicos"
			description="Tela exclusiva para o cadastro de servicos."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/servicos" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Servicos cadastrados" />}>
				<CadastroServicosContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroServicosContent({ searchParams }: CadastroServicosPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<ServicoFormSection searchParams={resolvedSearchParams} />
			) : null}
			<ServicosListSection searchParams={resolvedSearchParams} />
		</>
	);
}
