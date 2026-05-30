import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FornecedorFormSection } from "@/components/cadastro/fornecedores/fornecedor-form-section";
import { FornecedoresListSection } from "@/components/cadastro/fornecedores/fornecedores-list-section";

type CadastroFornecedoresPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroFornecedoresPage({
	searchParams,
}: CadastroFornecedoresPageProps) {
	return (
		<CadastroPageShell
			title="Fornecedores"
			description="Consulte fornecedores físicos ou jurídicos com dados fiscais, contato e cidade."
			tabs={null}
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
