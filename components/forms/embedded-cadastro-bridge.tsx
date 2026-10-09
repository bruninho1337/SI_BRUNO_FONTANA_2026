"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Também acompanha os redirects das server actions, sem navegar o formulário pai.
export function EmbeddedCadastroBridge() {
	const params = useSearchParams();
	const router = useRouter();
	const success = params.get("success");
	useEffect(() => {
		if (window.parent === window || window.name !== "cadastro-embedded") return;
		if (success) window.parent.postMessage({ type: "cadastro:saved" }, window.location.origin);
		function handleMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin || event.source !== window.parent) return;
			if (event.data?.type === "cadastro:refresh") router.refresh();
		}
		function handleEscape(event: KeyboardEvent) {
			// Um seletor aberto dentro do cadastro deve fechar antes do cadastro inteiro.
			if (event.key === "Escape" && !document.querySelector('[role="dialog"]')) {
				window.parent.postMessage({ type: "cadastro:close" }, window.location.origin);
			}
		}
		window.addEventListener("keydown", handleEscape);
		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("keydown", handleEscape);
			window.removeEventListener("message", handleMessage);
		};
	}, [success, router]);
	return null;
}
