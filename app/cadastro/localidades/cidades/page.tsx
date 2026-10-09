import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CidadeFormSection } from "@/components/cadastro/localidades/cidade-form-section";
import { CidadesListSection } from "@/components/cadastro/localidades/cidades-list-section";
import { LocalidadesTabs } from "@/components/cadastro/localidades/localidades-tabs";

type CadastroCidadesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default async function CadastroCidadesPage({ searchParams }: CadastroCidadesPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return <main className="p-3 sm:p-5" data-cadastro-embedded><CidadeFormSection searchParams={Promise.resolve(params)} /></main>;
	}
	return (
		<CadastroPageShell
			title="Cidades"
			description="Tela de consulta para a tabela de Cidades."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/cidades" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Cidades cadastradas" />}>
				<CadastroCidadesContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroCidadesContent({ searchParams }: CadastroCidadesPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<CidadeFormSection searchParams={resolvedSearchParams} />
			) : null}
			<CidadesListSection searchParams={resolvedSearchParams} />
		</>
	);
}
