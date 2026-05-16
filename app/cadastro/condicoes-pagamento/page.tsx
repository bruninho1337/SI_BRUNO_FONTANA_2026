import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CondicaoPagamentoFormSection } from "@/components/cadastro/condicoes-pagamento/condicao-pagamento-form-section";
import { CondicoesPagamentoListSection } from "@/components/cadastro/condicoes-pagamento/condicoes-pagamento-list-section";

type CadastroCondicoesPagamentoPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroCondicoesPagamentoPage({
	searchParams,
}: CadastroCondicoesPagamentoPageProps) {
	return (
		<CadastroPageShell
			title="Condicoes de Pagamento"
			description="Tela de consulta para a tabela de Condicoes de Pagamento."
			tabs={null}
		>
			<Suspense fallback={<CadastroSectionFallback title="Condicoes de pagamento cadastradas" />}>
				<CadastroCondicoesPagamentoContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroCondicoesPagamentoContent({
	searchParams,
}: CadastroCondicoesPagamentoPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<CondicaoPagamentoFormSection searchParams={resolvedSearchParams} />
			) : null}
			<CondicoesPagamentoListSection searchParams={resolvedSearchParams} />
		</>
	);
}
