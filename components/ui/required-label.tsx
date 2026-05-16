import type { ComponentProps } from "react";

import { Label } from "@/components/ui/label";

type RequiredLabelProps = ComponentProps<typeof Label>;

export function RequiredLabel({ children, ...props }: RequiredLabelProps) {
	return (
		<Label {...props}>
			{children}
			<span className="ml-1 text-red-600" aria-hidden="true">
				*
			</span>
			<span className="sr-only"> obrigatorio</span>
		</Label>
	);
}
