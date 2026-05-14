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
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroPaisesPage({ searchParams }: CadastroPaisesPageProps) {
	return (
		<CadastroPageShell
			title="Cadastro de Paises"
			description="Tela exclusiva para a tabela Paises."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/paises" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Paises cadastrados" />}>
				<CadastroPaisesContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroPaisesContent({ searchParams }: CadastroPaisesPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<PaisFormSection searchParams={resolvedSearchParams} />
			) : null}
			<PaisesListSection searchParams={resolvedSearchParams} />
		</>
	);
}
