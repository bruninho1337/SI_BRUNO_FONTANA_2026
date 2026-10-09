import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { UnidadeMedidaFormSection } from "@/components/cadastro/produtos-servicos/unidade-medida-form-section";
import { UnidadesMedidaListSection } from "@/components/cadastro/produtos-servicos/unidades-medida-list-section";
import { ProdutosServicosTabs } from "@/components/cadastro/produtos-servicos/produtos-servicos-tabs";

type CadastroUnidadesMedidaPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default async function CadastroUnidadesMedidaPage({
	searchParams,
}: CadastroUnidadesMedidaPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return <main className="p-3 sm:p-5" data-cadastro-embedded><UnidadeMedidaFormSection searchParams={Promise.resolve(params)} /></main>;
	}
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
