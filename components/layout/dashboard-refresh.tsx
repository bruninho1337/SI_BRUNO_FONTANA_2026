"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DashboardRefresh() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	return (
		<Button variant="outline" className="rounded-xl" disabled={pending}
			onClick={() => startTransition(() => router.refresh())}>
			{pending ? "Atualizando…" : "Atualizar dados"}
		</Button>
	);
}
