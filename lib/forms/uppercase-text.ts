export function uppercaseTextValue<T>(value: T): T | string {
	return typeof value === "string" ? value.toUpperCase() : value;
}

export function uppercaseTextField(field: HTMLInputElement | HTMLTextAreaElement) {
	const value = field.value;
	const uppercase = value.toUpperCase();

	if (value === uppercase) return;

	const { selectionStart, selectionEnd, selectionDirection } = field;
	field.value = uppercase;

	if (selectionStart !== null && selectionEnd !== null) {
		field.setSelectionRange(
			value.slice(0, selectionStart).toUpperCase().length,
			value.slice(0, selectionEnd).toUpperCase().length,
			selectionDirection ?? undefined
		);
	}
}
