import { Suspense } from "react";
import Link from "next/link";

import { CadastroPageShell } from "@/components/cadastro/cadastro-page-shell";
import { CadastroSectionFallback } from "@/components/cadastro/cadastro-section-fallback";
import { CompraFormSection } from "@/components/cadastro/compras/compra-form-section";
import { ComprasListSection } from "@/components/cadastro/compras/compras-list-section";

type ComprasPageProps = {
	searchParams?: Promise<{
		success?: string;
		error?: string;
		mode?: string;
		edit?: string;
		q?: string;
		modelo?: string;
		serie?: string;
		numero_nota?: string;
		codfornecedor?: string;
	}>;
};

export default function ComprasPage({ searchParams }: ComprasPageProps) {
	return (
		<CadastroPageShell
			title="Compras"
			description="Cadastre notas de entrada, itens comprados e atualize o estoque dos produtos."
			tabs={
				<div className="flex flex-wrap gap-3">
					<Link
						href="/cadastro/compras"
						className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
					>
						Compras
					</Link>
				</div>
			}
		>
			<Suspense fallback={<CadastroSectionFallback title="Compras cadastradas" />}>
				<ComprasPageContent searchParams={searchParams} />
			</Suspense>
		</CadastroPageShell>
	);
}

async function ComprasPageContent({ searchParams }: ComprasPageProps) {
	const params = await searchParams;
	const resolvedSearchParams = Promise.resolve(params ?? {});
	const showForm = params?.mode === "create" || Boolean(params?.edit);

	return (
		<>
			{showForm ? <CompraFormSection searchParams={resolvedSearchParams} /> : null}
			<ComprasListSection searchParams={resolvedSearchParams} />
		</>
	);
}
