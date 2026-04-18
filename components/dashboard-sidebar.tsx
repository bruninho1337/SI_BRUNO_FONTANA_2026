"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
	{
		href: "/dashboard/barbeiro",
		label: "Dashboard",
		description: "Visão geral do dia",
	},
];

const produtosServicosItems = [
	{
		href: "/cadastro/produtos-servicos/categorias",
		label: "Categorias",
	},
	{
		href: "/cadastro/produtos-servicos/produtos",
		label: "Produtos",
	},
	{
		href: "/cadastro/produtos-servicos/servicos",
		label: "Serviços",
	},
];

const localidadesItems = [
	{
		href: "/cadastro/localidades/paises",
		label: "Países",
	},
	{
		href: "/cadastro/localidades/estados",
		label: "Estados",
	},
	{
		href: "/cadastro/localidades/cidades",
		label: "Cidades",
	},
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const isProdutosServicosRoute = pathname.startsWith("/cadastro/produtos-servicos");
	const isLocalidadesRoute = pathname.startsWith("/cadastro/localidades");
	const [produtosServicosOpen, setProdutosServicosOpen] = useState(
		isProdutosServicosRoute
	);
	const [localidadesOpen, setLocalidadesOpen] = useState(isLocalidadesRoute);

	useEffect(() => {
		setProdutosServicosOpen(isProdutosServicosRoute);
	}, [isProdutosServicosRoute]);

	useEffect(() => {
		setLocalidadesOpen(isLocalidadesRoute);
	}, [isLocalidadesRoute]);

	return (
		<aside className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:w-72 lg:self-start">
			<div className="mb-5">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
					Painel
				</p>
				<h2 className="mt-2 text-xl font-semibold text-neutral-900">
					Navegação
				</h2>
			</div>

			<nav className="flex flex-col gap-3">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"rounded-2xl border px-4 py-3 transition",
								isActive
									? "border-neutral-900 bg-neutral-900 text-white"
									: "border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
							)}
						>
							<p className="text-sm font-semibold">{item.label}</p>
							<p
								className={cn(
									"mt-1 text-xs",
									isActive ? "text-neutral-200" : "text-neutral-500"
								)}
							>
								{item.description}
							</p>
						</Link>
					);
				})}

				<div className="rounded-2xl border border-neutral-200 bg-neutral-50">
					<button
						type="button"
						onClick={() => setProdutosServicosOpen((current) => !current)}
						className={cn(
							"flex w-full items-center justify-between px-4 py-3 text-left text-neutral-800 transition hover:bg-neutral-100",
							isProdutosServicosRoute &&
								"rounded-t-2xl bg-neutral-900 text-white hover:bg-neutral-900"
						)}
					>
						<div>
							<p className="text-sm font-semibold">Produtos e Serviços</p>
							<p
								className={cn(
									"mt-1 text-xs",
									isProdutosServicosRoute
										? "text-neutral-200"
										: "text-neutral-500"
								)}
							>
								Cadastros de produtos e serviços
							</p>
						</div>

						<span className="text-sm font-semibold">
							{produtosServicosOpen ? "−" : "+"}
						</span>
					</button>

					{produtosServicosOpen ? (
						<div className="flex flex-col gap-2 border-t border-neutral-200 px-3 py-3">
							{produtosServicosItems.map((item) => {
								const isActive = pathname === item.href;

								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"rounded-xl px-3 py-2 text-sm transition",
											isActive
												? "bg-neutral-900 text-white"
												: "text-neutral-700 hover:bg-neutral-100"
										)}
									>
										{item.label}
									</Link>
								);
							})}
						</div>
					) : null}
				</div>

				<div className="rounded-2xl border border-neutral-200 bg-neutral-50">
					<button
						type="button"
						onClick={() => setLocalidadesOpen((current) => !current)}
						className={cn(
							"flex w-full items-center justify-between px-4 py-3 text-left text-neutral-800 transition hover:bg-neutral-100",
							isLocalidadesRoute && "rounded-t-2xl bg-neutral-900 text-white hover:bg-neutral-900"
						)}
					>
						<div>
							<p className="text-sm font-semibold">Localidades</p>
							<p
								className={cn(
									"mt-1 text-xs",
									isLocalidadesRoute ? "text-neutral-200" : "text-neutral-500"
								)}
							>
								Países, estados e cidades
							</p>
						</div>

						<span className="text-sm font-semibold">
							{localidadesOpen ? "−" : "+"}
						</span>
					</button>

					{localidadesOpen ? (
						<div className="flex flex-col gap-2 border-t border-neutral-200 px-3 py-3">
							{localidadesItems.map((item) => {
								const isActive = pathname === item.href;

								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"rounded-xl px-3 py-2 text-sm transition",
											isActive
												? "bg-neutral-900 text-white"
												: "text-neutral-700 hover:bg-neutral-100"
										)}
									>
										{item.label}
									</Link>
								);
							})}
						</div>
					) : null}
				</div>
			</nav>
		</aside>
	);
}
