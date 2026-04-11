import Link from "next/link";

import { cn } from "@/lib/utils";

const tabItems = [
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

type LocalidadesTabsProps = {
	currentPath: string;
};

export function LocalidadesTabs({ currentPath }: LocalidadesTabsProps) {
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
