export const MAX_PURCHASE_INTEGER = 2147483647;
export const PURCHASE_MONEY_PATTERN = "(?:[0-9]+|[0-9]{1,3}(?:\\.[0-9]{3})+)(?:,[0-9]{1,2})?";

export function validPurchaseDigits(value: unknown, maxLength: number) {
	return typeof value === "string" && new RegExp(`^[0-9]{1,${maxLength}}$`).test(value);
}

export function validPurchaseInteger(value: unknown) {
	return (typeof value === "number" || typeof value === "string") &&
		/^[0-9]+$/.test(String(value)) && Number.isSafeInteger(Number(value)) &&
		Number(value) > 0 && Number(value) <= MAX_PURCHASE_INTEGER;
}

export function validPurchaseMoney(value: unknown) {
	if (typeof value === "number") return Number.isFinite(value) && value >= 0 && value < 1e12 && /^[0-9]+(?:\.[0-9]{1,2})?$/.test(String(value));
	if (typeof value !== "string" || value.length > 18 || !new RegExp(`^${PURCHASE_MONEY_PATTERN}$`).test(value)) return false;
	const amount = Number(value.replace(/\./g, "").replace(",", "."));
	return Number.isFinite(amount) && amount >= 0 && amount < 1e12;
}

// Permite estados intermediários de digitação, sem transformar entradas inválidas.
export function canTypePurchaseMoney(value: string) {
	return value.length <= 18 && /^(?:[0-9]{0,12}|[0-9]{1,3}(?:\.[0-9]{3})*\.[0-9]{0,3})(?:,[0-9]{0,2})?$/.test(value);
}

export function validPurchasePreciseCost(value: unknown) {
	return typeof value === "string" && value.length <= 45 && /^[0-9]+(?:\.[0-9]{1,32})?$/.test(value) && Number(value) < 1e12;
}
