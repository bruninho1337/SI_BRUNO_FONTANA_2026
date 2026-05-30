import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { UnidadeMedidaFormSection } from "@/components/cadastro/produtos-servicos/unidade-medida-form-section";
import { UnidadesMedidaListSection } from "@/components/cadastro/produtos-servicos/unidades-medida-list-section";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";

type CadastroUnidadesMedidaPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroUnidadesMedidaPage({
	searchParams,
}: CadastroUnidadesMedidaPageProps) {
	return (
		<CadastroPageShell
			title="Unidades de Medida"
			description="Cadastre unidades usadas para controlar produtos e estoque."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/unidades-medida" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Unidades de medida cadastradas" />}>
				<CadastroUnidadesMedidaContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroUnidadesMedidaContent({
	searchParams,
}: CadastroUnidadesMedidaPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? <UnidadeMedidaFormSection searchParams={resolvedSearchParams} /> : null}
			<UnidadesMedidaListSection searchParams={resolvedSearchParams} />
		</>
	);
}
