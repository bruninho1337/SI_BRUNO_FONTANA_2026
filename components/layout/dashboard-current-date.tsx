"use client";

import { useEffect, useState } from "react";

export function DashboardCurrentDate() {
	const [hoje, setHoje] = useState("");

	useEffect(() => {
		const dataAtual = new Date().toLocaleDateString("pt-BR", {
			weekday: "long",
			day: "2-digit",
			month: "long",
			year: "numeric",
		});

		setHoje(dataAtual);
	}, []);

	if (!hoje) {
		return (
			<p className="text-sm text-neutral-600">
				Resumo da sua rotina de hoje
			</p>
		);
	}

	return (
		<p className="text-sm text-neutral-600 capitalize">
			Resumo da sua rotina de hoje — {hoje}
		</p>
	);
}
