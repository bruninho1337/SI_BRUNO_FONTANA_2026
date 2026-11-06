import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { EstadoFormSection } from "@/components/cadastro/localidades/estado-form-section";
import { EstadosListSection } from "@/components/cadastro/localidades/estados-list-section";
import { LocalidadesTabs } from "@/components/cadastro/localidades/localidades-tabs";

type CadastroEstadosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroEstadosPage(props: CadastroEstadosPageProps) {
	return (
		<Suspense fallback={<CadastroSectionFallback title="Cadastro" />}>
			<CadastroEstadosRoute {...props} />
		</Suspense>
	);
}

async function CadastroEstadosRoute({ searchParams }: CadastroEstadosPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return (
			<main className="p-3 sm:p-5" data-cadastro-embedded>
				<Suspense fallback={<CadastroSectionFallback title="Formulário" />}>
					<EstadoFormSection searchParams={Promise.resolve(params)} />
				</Suspense>
			</main>
		);
	}
	return (
		<CadastroPageShell
			title="Estados"
			description="Tela de consulta para a tabela de Estados."
			tabs={<LocalidadesTabs currentPath="/cadastro/localidades/estados" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Estados cadastrados" />}>
				<CadastroEstadosContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroEstadosContent({ searchParams }: CadastroEstadosPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<EstadoFormSection searchParams={resolvedSearchParams} />
			) : null}
			<EstadosListSection searchParams={resolvedSearchParams} />
		</>
	);
}
