type AuditDatesProps = {
	createdAt?: string | number | Date | null;
	updatedAt?: string | number | Date | null;
};

function formatDateTime(value: string | number | Date | null | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function AuditDates({ createdAt, updatedAt }: AuditDatesProps) {
	if (!createdAt && !updatedAt) {
		return null;
	}

	return (
		<div className="grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium text-neutral-800">Data de criacao:</span>
				<span className="text-sm text-neutral-600">{formatDateTime(createdAt)}</span>
			</div>

			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium text-neutral-800">Data de atualizacao:</span>
				<span className="text-sm text-neutral-600">{formatDateTime(updatedAt)}</span>
			</div>
		</div>
	);
}
