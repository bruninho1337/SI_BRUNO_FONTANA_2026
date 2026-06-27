import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FinanceiroTabs } from "@/components/cadastro/financeiro/financeiro-tabs";
import { FormaPagamentoFormSection } from "@/components/cadastro/formas-pagamento/forma-pagamento-form-section";
import { FormasPagamentoListSection } from "@/components/cadastro/formas-pagamento/formas-pagamento-list-section";

type CadastroFormasPagamentoPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroFormasPagamentoPage({
	searchParams,
}: CadastroFormasPagamentoPageProps) {
	return (
		<CadastroPageShell
			title="Formas de Pagamento"
			description="Cadastre os meios aceitos para recebimentos e pagamentos."
			tabs={<FinanceiroTabs currentPath="/cadastro/formas-pagamento" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Formas de pagamento cadastradas" />}>
				<CadastroFormasPagamentoContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroFormasPagamentoContent({
	searchParams,
}: CadastroFormasPagamentoPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<FormaPagamentoFormSection searchParams={resolvedSearchParams} />
			) : null}
			<FormasPagamentoListSection searchParams={resolvedSearchParams} />
		</>
	);
}
