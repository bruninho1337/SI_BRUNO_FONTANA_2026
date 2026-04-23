export function CadastroSectionFallback({ title }: { title: string }) {
	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
				<span className="text-sm text-neutral-400">Carregando...</span>
			</div>
			<div className="space-y-3">
				<div className="h-12 rounded-xl bg-neutral-100" />
				<div className="h-12 rounded-xl bg-neutral-100" />
				<div className="h-12 rounded-xl bg-neutral-100" />
			</div>
		</div>
	);
}
