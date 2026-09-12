import type { ReactNode } from "react";

type ParcelasLayoutProps = {
	title?: string;
	description: string;
	action?: ReactNode;
	children: ReactNode;
};

export function ParcelasLayout({ title = "Parcelas", description, action, children }: ParcelasLayoutProps) {
	return (
		<section className="space-y-3 text-neutral-900">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h3 className="text-base font-semibold text-neutral-900">{title}</h3>
					<p className="text-sm text-neutral-500">{description}</p>
				</div>
				{action}
			</div>
			<div className="space-y-3">{children}</div>
		</section>
	);
}

export function ParcelaRow({ children }: { children: ReactNode }) {
	return (
		<div className="grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-900 md:grid-cols-12">
			{children}
		</div>
	);
}
