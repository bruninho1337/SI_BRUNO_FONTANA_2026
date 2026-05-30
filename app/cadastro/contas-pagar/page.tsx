import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { ContaPagarFormSection } from "@/components/cadastro/contas-pagar/conta-pagar-form-section";
import { ContasPagarListSection } from "@/components/cadastro/contas-pagar/contas-pagar-list-section";

type CadastroContasPagarPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroContasPagarPage({
	searchParams,
}: CadastroContasPagarPageProps) {
	return (
		<CadastroPageShell
			title="Contas a Pagar"
			description="Controle contas, fornecedores, vencimentos, pagamentos e status financeiro."
			tabs={null}
		>
			<Suspense fallback={<CadastroSectionFallback title="Contas a pagar cadastradas" />}>
				<CadastroContasPagarContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroContasPagarContent({
	searchParams,
}: CadastroContasPagarPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<ContaPagarFormSection searchParams={resolvedSearchParams} />
			) : null}
			<ContasPagarListSection searchParams={resolvedSearchParams} />
		</>
	);
}
