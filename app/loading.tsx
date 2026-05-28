export default function Loading() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-white">
			<div
				className="flex flex-col items-center gap-4"
				aria-label="Carregando"
				role="status"
			>
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
				<p className="text-sm font-medium text-neutral-700">Carregando...</p>
			</div>
		</main>
	);
}
