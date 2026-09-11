import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardCurrentDate } from "@/components/layout/dashboard-current-date";
import { DashboardRefresh } from "@/components/layout/dashboard-refresh";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { carregarDashboard } from "@/lib/data/dashboard";

const panel = "min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6";
const linkStyle = "text-sm font-medium text-neutral-700 underline underline-offset-4 hover:text-black";

function currency(value: string) {
	return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function LoadError() {
	return <p role="alert" className="text-sm text-red-700">Não foi possível carregar estes dados. Tente atualizar a dashboard.</p>;
}

export default function BarbeiroDashboardPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-neutral-100 p-4 sm:p-6 md:p-8">
				<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
					<DashboardSidebar />
					<div className={`${panel} flex-1`} role="status">Carregando dashboard…</div>
				</div>
			</div>
		}>
			<DashboardContent />
		</Suspense>
	);
}

async function DashboardContent() {
	await connection();
	const { resumo, contas, compras } = await carregarDashboard();
	const data = resumo.data;
	const cards = data ? [
		{ label: "Clientes ativos", value: data.clientes.toLocaleString("pt-BR"), detail: "Clientes cadastrados", href: "/cadastro/clientes" },
		{ label: "Serviços ativos", value: data.servicos.toLocaleString("pt-BR"), detail: "Serviços disponíveis no cadastro", href: "/cadastro/produtos-servicos/servicos" },
		{ label: "Produtos ativos", value: data.produtos.toLocaleString("pt-BR"), detail: `${data.sem_estoque} sem estoque`, href: "/cadastro/produtos-servicos/produtos" },
		{ label: "Saldo a pagar", value: currency(data.saldo_pendente), detail: `${data.contas_vencidas} conta(s) vencida(s) · pendentes ativas`, href: "/cadastro/contas-pagar" },
	] : [];

	return (
		<div className="min-h-screen w-full overflow-x-hidden bg-neutral-100 p-4 sm:p-6 md:p-8">
			<div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 lg:flex-row">
				<DashboardSidebar />
				<main className="min-w-0 flex-1 space-y-6">
					<header className={`${panel} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Dashboard da Barbearia</h1>
							<DashboardCurrentDate />
							<p className="text-sm text-neutral-500">Visão geral dos cadastros, estoque e contas da barbearia.</p>
						</div>
						<DashboardRefresh />
					</header>

					{resumo.error || !data ? <div className={panel}><LoadError /></div> : (
						<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
							{cards.map((card) => (
								<Link key={card.label} href={card.href} className={`${panel} transition hover:border-neutral-400`}>
									<h2 className="text-sm text-neutral-500">{card.label}</h2>
									<p className="mt-2 break-words text-2xl font-bold text-neutral-900">{card.value}</p>
									<p className="mt-2 text-xs text-neutral-500">{card.detail}</p>
								</Link>
							))}
						</div>
					)}

					<div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
						<section className={`${panel} xl:col-span-2`}>
							<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-xl font-semibold text-neutral-900">Contas pendentes</h2>
									<p className="mt-1 text-sm text-neutral-500">Até 5 contas por vencimento, com as vencidas primeiro.</p>
								</div>
								<Link className={linkStyle} href="/cadastro/contas-pagar">Ver todas</Link>
							</div>
							{contas.error ? <LoadError /> : !contas.data?.length ? (
								<p className="py-6 text-sm text-neutral-500">Nenhuma conta ativa com saldo pendente.</p>
							) : (
								<div className="space-y-3">
									{contas.data.map((conta) => (
										<Link key={conta.codconta_pagar} href={`/cadastro/contas-pagar?edit=${conta.codconta_pagar}`}
											className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between">
											<div className="min-w-0">
												<p className="break-words font-semibold text-neutral-900">{conta.conta_pagar}</p>
												<p className="break-words text-sm text-neutral-600">{conta.fornecedor}</p>
												<p className="mt-1 text-xs text-neutral-500">Vencimento: {conta.vencimento}</p>
											</div>
											<div className="shrink-0 space-y-2 sm:text-right">
												<p className="font-semibold text-neutral-900">{currency(conta.saldo)}</p>
												<span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${conta.situacao === "Vencida" ? "bg-red-50 text-red-700" : conta.situacao === "Vence hoje" ? "bg-amber-50 text-amber-800" : "bg-neutral-100 text-neutral-700"}`}>{conta.situacao}</span>
											</div>
										</Link>
									))}
								</div>
							)}
						</section>

						<section className={panel}>
							<h2 className="text-xl font-semibold text-neutral-900">Ações rápidas</h2>
							<div className="mt-5 flex flex-col gap-3">
								{[
									["Cadastrar cliente", "/cadastro/clientes?mode=create"],
									["Registrar compra", "/cadastro/compras?mode=create"],
									["Cadastrar conta a pagar", "/cadastro/contas-pagar?mode=create"],
									["Consultar produtos", "/cadastro/produtos-servicos/produtos"],
									["Consultar serviços", "/cadastro/produtos-servicos/servicos"],
								].map(([label, href]) => (
									<Link key={href} href={href} className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">{label}</Link>
								))}
							</div>
						</section>
					</div>

					<section className={panel}>
						<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 className="text-xl font-semibold text-neutral-900">Compras recentes</h2>
								<p className="mt-1 text-sm text-neutral-500">Até 5 compras ativas e confirmadas, por data de emissão.</p>
							</div>
							<Link className={linkStyle} href="/cadastro/compras">Ver todas</Link>
						</div>
						{compras.error ? <LoadError /> : !compras.data?.length ? (
							<p className="py-6 text-sm text-neutral-500">Nenhuma compra ativa e confirmada cadastrada.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="text-neutral-500"><tr>
										<th scope="col" className="px-3 py-3 font-medium">Emissão</th>
										<th scope="col" className="px-3 py-3 font-medium">Nota / série / modelo</th>
										<th scope="col" className="px-3 py-3 font-medium">Fornecedor</th>
										<th scope="col" className="px-3 py-3 text-right font-medium">Valor total</th>
									</tr></thead>
									<tbody>{compras.data.map((compra) => (
										<tr key={JSON.stringify([compra.modelo, compra.serie, compra.numero_nota, compra.codfornecedor])} className="border-t border-neutral-100 text-neutral-800">
											<td className="whitespace-nowrap px-3 py-4">{compra.emissao}</td>
											<td className="px-3 py-4">{compra.numero_nota} / {compra.serie} / {compra.modelo}</td>
											<td className="px-3 py-4">{compra.fornecedor}</td>
											<td className="whitespace-nowrap px-3 py-4 text-right font-semibold">{currency(compra.valor_total)}</td>
										</tr>
									))}</tbody>
								</table>
							</div>
						)}
					</section>
				</main>
			</div>
		</div>
	);
}
