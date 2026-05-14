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
		<div className="min-h-screen w-full overflow-x-hidden bg-neutral-100 p-4 sm:p-6 md:p-8">
			<div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 lg:flex-row">
				<DashboardSidebar />

				<div className="min-w-0 flex-1 space-y-8">
					<div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="min-w-0">
								<h1 className="break-words text-2xl font-bold text-neutral-900 md:text-3xl">{title}</h1>
								<p className="mt-2 text-sm text-neutral-600">{description}</p>
							</div>

							<Button asChild className="w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 md:w-auto">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>

						<div className="mt-6 min-w-0">{tabs}</div>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
