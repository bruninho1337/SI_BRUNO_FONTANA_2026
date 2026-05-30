import { Suspense } from "react";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { FuncaoFuncionarioFormSection } from "@/components/cadastro/funcionarios/funcao-funcionario-form-section";
import { FuncoesFuncionariosListSection } from "@/components/cadastro/funcionarios/funcoes-funcionarios-list-section";

type CadastroFuncoesFuncionariosPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
	}>;
};

export default function CadastroFuncoesFuncionariosPage({
	searchParams,
}: CadastroFuncoesFuncionariosPageProps) {
	return (
		<CadastroPageShell
			title="Funções de Funcionários"
			description="Cadastre cargos e funções para vincular aos funcionários."
			tabs={null}
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
