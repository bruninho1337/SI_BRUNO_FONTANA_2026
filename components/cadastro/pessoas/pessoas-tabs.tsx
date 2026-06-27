import Link from "next/link";

import { cn } from "@/lib/shared/utils";

const tabItems = [
	{
		href: "/cadastro/clientes",
		label: "Clientes",
	},
	{
		href: "/cadastro/funcionarios",
		label: "Funcionários",
	},
	{
		href: "/cadastro/funcoes-funcionarios",
		label: "Funções de Funcionários",
	},
	{
		href: "/cadastro/fornecedores",
		label: "Fornecedores",
	},
];

type PessoasTabsProps = {
	currentPath: string;
};

export function PessoasTabs({ currentPath }: PessoasTabsProps) {
	return (
		<div className="flex flex-wrap gap-3">
			{tabItems.map((item) => {
				const isActive = currentPath === item.href;

				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"rounded-full border px-4 py-2 text-sm font-medium transition",
							isActive
								? "border-neutral-900 bg-neutral-900 text-white"
								: "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</div>
	);
}
