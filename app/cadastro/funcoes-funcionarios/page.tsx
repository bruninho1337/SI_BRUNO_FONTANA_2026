import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FuncaoFuncionarioFormSection } from "@/components/cadastro/funcionarios/funcao-funcionario-form-section";
import { FuncoesFuncionariosListSection } from "@/components/cadastro/funcionarios/funcoes-funcionarios-list-section";
import { PessoasTabs } from "@/components/cadastro/pessoas/pessoas-tabs";

type CadastroFuncoesFuncionariosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		embedded?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default async function CadastroFuncoesFuncionariosPage({
	searchParams,
}: CadastroFuncoesFuncionariosPageProps) {
	const params = await searchParams;
	if (params?.embedded === "1") {
		return <main className="p-3 sm:p-5" data-cadastro-embedded><FuncaoFuncionarioFormSection searchParams={Promise.resolve(params)} /></main>;
	}
	return (
		<CadastroPageShell
			title="Funções de Funcionários"
			description="Cadastre cargos e funções para vincular aos funcionários."
			tabs={<PessoasTabs currentPath="/cadastro/funcoes-funcionarios" />}
		>
			<Suspense fallback={<CadastroSectionFallback title="Funções cadastradas" />}>
				<CadastroFuncoesFuncionariosContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function CadastroFuncoesFuncionariosContent({
	searchParams,
}: CadastroFuncoesFuncionariosPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? (
				<FuncaoFuncionarioFormSection searchParams={resolvedSearchParams} />
			) : null}
			<FuncoesFuncionariosListSection searchParams={resolvedSearchParams} />
		</>
	);
}
