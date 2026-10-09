export type PaymentTerm = {
	num_parcela: number;
	dias_vencimento: number;
	percentual: number;
	codforma_pagamento: number | null;
	forma_pagamento: string;
};

type DecimalValue = number | string;
const ZERO = BigInt(0);
const TEN = BigInt(10);

// Converte o decimal escrito em uma razão inteira, sem operações de ponto flutuante.
function decimalParts(value: DecimalValue) {
	const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(String(value).trim());
	if (!match) throw new Error("Valor decimal inválido.");
	const fraction = match[3] ?? "";
	const exponent = Number(match[4] ?? 0);
	let coefficient = BigInt(match[2] + fraction) * (match[1] === "-" ? -BigInt(1) : BigInt(1));
	let scale = fraction.length - exponent;
	if (Math.abs(scale) > 100) throw new Error("Precisão decimal inválida.");
	if (scale < 0) { coefficient *= TEN ** BigInt(-scale); scale = 0; }
	return { coefficient, scale };
}

function roundedDivision(numerator: bigint, denominator: bigint) {
	const sign = numerator < ZERO ? -BigInt(1) : BigInt(1);
	const absolute = numerator * sign;
	return ((absolute + denominator / BigInt(2)) / denominator) * sign;
}

function cents(value: DecimalValue) {
	const { coefficient, scale } = decimalParts(value);
	return scale <= 2 ? coefficient * TEN ** BigInt(2 - scale) : roundedDivision(coefficient, TEN ** BigInt(scale - 2));
}

function fromCents(value: bigint) {
	const result = Number(value);
	return Number.isSafeInteger(result) ? result / 100 : NaN;
}

function integerWeights(values: DecimalValue[]) {
	const parts = values.map(decimalParts);
	const scale = Math.max(0, ...parts.map((part) => part.scale));
	return parts.map((part) => part.coefficient * TEN ** BigInt(scale - part.scale));
}

export function roundMoney(value: DecimalValue) {
	return typeof value === "number" && !Number.isFinite(value) ? value : fromCents(cents(value));
}

export function sumMoney(values: DecimalValue[]) {
	if (values.some((value) => typeof value === "number" && !Number.isFinite(value))) return NaN;
	return fromCents(values.reduce<bigint>((total, value) => total + cents(value), ZERO));
}

// Arredonda apenas o total final do item, preservando a precisão do custo por unidade.
export function purchaseItemTotal(quantity: number, unitCost: DecimalValue, discount: DecimalValue) {
	if (!Number.isSafeInteger(quantity)) throw new Error("Quantidade inválida.");
	const [unit, deduction] = integerWeights([unitCost, discount]);
	const scale = Math.max(decimalParts(unitCost).scale, decimalParts(discount).scale);
	const amount = unit * BigInt(quantity) - deduction;
	return fromCents(scale <= 2 ? amount * TEN ** BigInt(2 - scale) : roundedDivision(amount, TEN ** BigInt(scale - 2)));
}

export function purchaseDiscountExceedsTotal(quantity: number, unitCost: DecimalValue, discount: DecimalValue) {
	const [unit, deduction] = integerWeights([unitCost, discount]);
	return deduction > unit * BigInt(quantity);
}

export function validPaymentPercentages(percentages: number[]) {
	if (!percentages.length || percentages.some((value) => !Number.isFinite(value) || value <= 0)) return false;
	const weights = integerWeights([...percentages, 100]);
	const hundred = weights.pop()!;
	return weights.reduce((a, b) => a + b, ZERO) === hundred;
}

// Distribui centavos por restos inteiros exatos; empates seguem a ordem dos itens.
export function allocateMoney(total: number, weights: DecimalValue[]) {
	if (!weights.length) return [];
	if (!Number.isFinite(total)) return weights.map(() => 0);
	const integers = integerWeights(weights);
	if (integers.some((weight) => weight < ZERO)) throw new Error("Pesos de rateio inválidos.");
	const sum = integers.reduce((a, b) => a + b, ZERO);
	if (sum === ZERO) return weights.map(() => 0);
	const totalCents = cents(total);
	const sign = totalCents < ZERO ? -BigInt(1) : BigInt(1);
	const absolute = totalCents * sign;
	const numerators = integers.map((weight) => absolute * weight);
	const values = numerators.map((value) => value / sum);
	const order = numerators.map((value, index) => ({ index, remainder: value % sum }))
		.sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
	const remaining = Number(absolute - values.reduce((a, b) => a + b, ZERO));
	for (let i = 0; i < remaining; i++) values[order[i].index] += BigInt(1);
	return values.map((value) => fromCents(value * sign));
}

// Percentuais iguais recebem valores iguais; as comparações também são exatas.
export function allocateInstallments(total: number, percentages: number[]): number[] | null {
	if (!percentages.length) return [];
	if (!Number.isFinite(total) || total < 0 || percentages.some((value) => !Number.isFinite(value) || value <= 0)) return null;
	const weights = integerWeights(percentages);
	const sum = weights.reduce((a, b) => a + b, ZERO);
	const totalCents = cents(total);
	const groups = [...new Set(percentages)].map((percentage) => {
		const count = percentages.filter((value) => value === percentage).length;
		const numerator = totalCents * weights[percentages.indexOf(percentage)];
		return { percentage, count, numerator, base: Number(roundedDivision(numerator, sum)) };
	});
	const remainder = Number(totalCents) - groups.reduce((value, group) => value + group.base * group.count, 0);
	const limit = percentages.length;
	let states = new Map<number, { cost: bigint; values: number[] }>([[0, { cost: ZERO, values: [] }]]);
	for (const group of groups) {
		const next = new Map<number, { cost: bigint; values: number[] }>();
		const maxAdjustment = Math.ceil(limit / group.count);
		for (const [adjusted, state] of states) {
			for (let adjustment = -maxAdjustment; adjustment <= maxAdjustment; adjustment++) {
				const value = group.base + adjustment;
				const target = adjusted + adjustment * group.count;
				if (value < 0 || Math.abs(target) > limit) continue;
				const difference = BigInt(value) * sum - group.numerator;
				const cost = state.cost + BigInt(group.count) * difference * difference;
				if (!next.has(target) || cost < next.get(target)!.cost) next.set(target, { cost, values: [...state.values, value] });
			}
		}
		states = next;
	}
	const result = states.get(remainder);
	if (!result) return null;
	const byPercentage = new Map(groups.map((group, index) => [group.percentage, result.values[index] / 100]));
	return percentages.map((percentage) => byPercentage.get(percentage)!);
}

export function allocatePurchaseCosts(total: number, unitCosts: DecimalValue[]) {
	return allocateMoney(total, unitCosts);
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
