import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { ClienteFormSection } from "@/components/cadastro/clientes/cliente-form-section";
import { ClientesListSection } from "@/components/cadastro/clientes/clientes-list-section";
import { PessoasTabs } from "@/components/cadastro/pessoas/pessoas-tabs";

type CadastroClientesPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroClientesPage({
	searchParams,
}: CadastroClientesPageProps) {
	return (
		<CadastroPageShell
			title="Clientes"
			description="Consulte clientes físicos ou jurídicos com cidade, e-mail ou documento."
			tabs={<PessoasTabs currentPath="/cadastro/clientes" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Clientes cadastrados" />}>
				<CadastroClientesContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroClientesContent({
	searchParams,
}: CadastroClientesPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<ClienteFormSection searchParams={resolvedSearchParams} />
			) : null}
			<ClientesListSection searchParams={resolvedSearchParams} />
		</>
	);
}
