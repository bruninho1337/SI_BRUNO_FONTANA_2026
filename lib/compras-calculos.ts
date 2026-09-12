export type PaymentTerm = {
	num_parcela: number;
	dias_vencimento: number;
	percentual: number;
	codforma_pagamento: number | null;
	forma_pagamento: string;
};

export function roundMoney(value: number) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Distribui os centavos restantes pelas maiores frações, mantendo a soma exata.
export function allocateMoney(total: number, weights: number[]) {
	const sum = weights.reduce((a, b) => a + b, 0);
	if (!sum || !Number.isFinite(sum)) return weights.map(() => 0);
	const cents = Math.round(Math.abs(total) * 100);
	const shares = weights.map((weight) => cents * weight / sum);
	const values = shares.map(Math.floor);
	const order = shares.map((share, index) => ({ index, fraction: share - values[index] }))
		.sort((a, b) => b.fraction - a.fraction || a.index - b.index);
	const remaining = cents - values.reduce((a, b) => a + b, 0);
	for (let i = 0; i < remaining; i++) values[order[i % order.length].index]++;
	return values.map((value) => value * Math.sign(total) / 100);
}

export function isIsoDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T12:00:00Z`);
	return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(value: string, days: number) {
	if (!isIsoDate(value)) return "";
	const date = new Date(`${value}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export function purchaseToday() {
	return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
