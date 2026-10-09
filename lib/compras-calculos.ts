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

// Ajusta os centavos por grupo: percentuais iguais sempre recebem valores iguais.
export function allocateInstallments(total: number, percentages: number[]): number[] | null {
	if (!percentages.length) return [];
	const sum = percentages.reduce((a, b) => a + b, 0);
	if (!Number.isFinite(total) || total < 0 || !Number.isFinite(sum) || sum <= 0 || percentages.some((value) => value <= 0)) return null;
	const cents = Math.round(total * 100);
	const groups = [...new Set(percentages)].map((percentage) => {
		const count = percentages.filter((value) => value === percentage).length;
		const exact = cents * percentage / sum;
		return { percentage, count, exact, base: Math.round(exact) };
	});
	const remainder = cents - groups.reduce((value, group) => value + group.base * group.count, 0);
	const limit = percentages.length;
	let states = new Map<number, { cost: number; values: number[] }>([[0, { cost: 0, values: [] }]]);
	for (const group of groups) {
		const next = new Map<number, { cost: number; values: number[] }>();
		const maxAdjustment = Math.ceil(limit / group.count);
		for (const [adjusted, state] of states) {
			for (let adjustment = -maxAdjustment; adjustment <= maxAdjustment; adjustment++) {
				const value = group.base + adjustment;
				const target = adjusted + adjustment * group.count;
				if (value < 0 || Math.abs(target) > limit) continue;
				const cost = state.cost + group.count * (value - group.exact) ** 2;
				if (!next.has(target) || cost < next.get(target)!.cost) {
					next.set(target, { cost, values: [...state.values, value] });
				}
			}
		}
		states = next;
	}
	const result = states.get(remainder);
	if (!result) return null;
	const byPercentage = new Map(groups.map((group, index) => [group.percentage, result.values[index] / 100]));
	return percentages.map((percentage) => byPercentage.get(percentage)!);
}

// O valor armazenado continua sendo o rateio total do item; a base é o custo unitário.
export function allocatePurchaseCosts(total: number, unitCosts: number[]) {
	return allocateMoney(total, unitCosts.map((cost) => Math.max(0, roundMoney(cost))));
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
