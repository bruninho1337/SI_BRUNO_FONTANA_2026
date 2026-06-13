"use client";

import { Input } from "@/components/ui/input";
import { formatCpfCnpj, formatRg } from "@/lib/shared/formatters";

type MaskedDocumentInputProps = React.ComponentProps<typeof Input> & {
	mask: "cpf" | "rg";
};

const formatters = {
	cpf: (value: string) => formatCpfCnpj(value, 11),
	rg: formatRg,
};

export function MaskedDocumentInput({
	mask,
	defaultValue,
	onInput,
	...props
}: MaskedDocumentInputProps) {
	function handleInput(
		event: Parameters<NonNullable<MaskedDocumentInputProps["onInput"]>>[0]
	) {
		const input = event.currentTarget;

		input.value = formatters[mask](input.value);
		onInput?.(event);
	}

	return (
		<Input
			{...props}
			defaultValue={formatters[mask](String(defaultValue ?? ""))}
			onInput={handleInput}
		/>
	);
}
