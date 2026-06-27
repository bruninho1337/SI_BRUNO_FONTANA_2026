import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FuncionarioFormSection } from "@/components/cadastro/funcionarios/funcionario-form-section";
import { FuncionariosListSection } from "@/components/cadastro/funcionarios/funcionarios-list-section";
import { PessoasTabs } from "@/components/cadastro/pessoas/pessoas-tabs";

type CadastroFuncionariosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroFuncionariosPage({
	searchParams,
}: CadastroFuncionariosPageProps) {
	return (
		<CadastroPageShell
			title="Funcionários"
			description="Consulte funcionários, cargos, contatos e regras de pagamento."
			tabs={<PessoasTabs currentPath="/cadastro/funcionarios" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Funcionários cadastrados" />}>
				<CadastroFuncionariosContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroFuncionariosContent({
	searchParams,
}: CadastroFuncionariosPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<FuncionarioFormSection searchParams={resolvedSearchParams} />
			) : null}
			<FuncionariosListSection searchParams={resolvedSearchParams} />
		</>
	);
}
