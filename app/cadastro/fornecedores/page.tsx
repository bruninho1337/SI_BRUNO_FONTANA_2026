import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FornecedorFormSection } from "@/components/cadastro/fornecedores/fornecedor-form-section";
import { FornecedoresListSection } from "@/components/cadastro/fornecedores/fornecedores-list-section";
import { PessoasTabs } from "@/components/cadastro/pessoas/pessoas-tabs";

type CadastroFornecedoresPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default async function CadastroFornecedoresPage({
	searchParams,
}: CadastroFornecedoresPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return <main className="p-3 sm:p-5" data-cadastro-embedded><FornecedorFormSection searchParams={Promise.resolve(params)} /></main>;
	}
	return (
		<CadastroPageShell
			title="Fornecedores"
			description="Consulte fornecedores físicos ou jurídicos com dados fiscais, contato e cidade."
			tabs={<PessoasTabs currentPath="/cadastro/fornecedores" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Fornecedores cadastrados" />}>
				<CadastroFornecedoresContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroFornecedoresContent({
	searchParams,
}: CadastroFornecedoresPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<FornecedorFormSection searchParams={resolvedSearchParams} />
			) : null}
			<FornecedoresListSection searchParams={resolvedSearchParams} />
		</>
	);
}
