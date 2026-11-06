"use client";

import { useSyncExternalStore } from "react";

function subscribeToDate(onChange: () => void) {
	const interval = window.setInterval(onChange, 60_000);
	return () => window.clearInterval(interval);
}

function getCurrentDate() {
	return new Date().toLocaleDateString("pt-BR", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

const getServerDate = () => "";

export function DashboardCurrentDate() {
	const hoje = useSyncExternalStore(subscribeToDate, getCurrentDate, getServerDate);

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
