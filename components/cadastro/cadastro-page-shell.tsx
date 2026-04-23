import type { ReactNode } from "react";
import Link from "next/link";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";

type CadastroPageShellProps = {
	title: string;
	description: string;
	tabs: ReactNode;
	children: ReactNode;
};

export function CadastroPageShell({
	title,
	description,
	tabs,
	children,
}: CadastroPageShellProps) {
	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />

				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
								<p className="mt-2 text-sm text-neutral-600">{description}</p>
							</div>

							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>

						<div className="mt-6">{tabs}</div>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
