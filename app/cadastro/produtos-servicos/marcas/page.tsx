import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { MarcaFormSection } from "@/components/cadastro/produtos-servicos/marca-form-section";
import { MarcasListSection } from "@/components/cadastro/produtos-servicos/marcas-list-section";
import { ProdutosServicosTabs } from "@/components/cadastro/produtos-servicos/produtos-servicos-tabs";

type CadastroMarcasPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroMarcasPage(props: CadastroMarcasPageProps) {
	return (
		<Suspense fallback={<CadastroSectionFallback title="Cadastro" />}>
			<CadastroMarcasRoute {...props} />
		</Suspense>
	);
}

async function CadastroMarcasRoute({ searchParams }: CadastroMarcasPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return (
			<main className="p-3 sm:p-5" data-cadastro-embedded>
				<Suspense fallback={<CadastroSectionFallback title="Formulário" />}>
					<MarcaFormSection searchParams={Promise.resolve(params)} />
				</Suspense>
			</main>
		);
	}
	return (
		<CadastroPageShell
			title="Marcas"
			description="Tela de consulta para a tabela de Marcas."
			tabs={<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/marcas" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Marcas cadastradas" />}>
				<CadastroMarcasContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroMarcasContent({ searchParams }: CadastroMarcasPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? <MarcaFormSection searchParams={resolvedSearchParams} /> : null}
			<MarcasListSection searchParams={resolvedSearchParams} />
		</>
	);
}
