"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingOverlay() {
	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
			role="status"
			aria-live="polite"
			aria-label="Carregando"
		>
			<div className="flex flex-col items-center gap-4">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
				<p className="text-sm font-medium text-neutral-700">Carregando...</p>
			</div>
		</div>
	);
}

function NavigationLoadingInner() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(false);
	}, [pathname, searchParams]);

	useEffect(() => {
		function handleClick(event: MouseEvent) {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const target = event.target instanceof Element ? event.target : null;
			const anchor = target?.closest<HTMLAnchorElement>("a[href]");

			if (!anchor || anchor.target || anchor.hasAttribute("download")) {
				return;
			}

			const nextUrl = new URL(anchor.href, window.location.href);

			if (nextUrl.origin !== window.location.origin) {
				return;
			}

			const currentUrl = new URL(window.location.href);

			if (
				nextUrl.pathname === currentUrl.pathname &&
				nextUrl.search === currentUrl.search &&
				nextUrl.hash
			) {
				return;
			}

			if (
				nextUrl.pathname !== currentUrl.pathname ||
				nextUrl.search !== currentUrl.search
			) {
				setIsLoading(true);
			}
		}

		function handlePageShow() {
			setIsLoading(false);
		}

		document.addEventListener("click", handleClick, true);
		window.addEventListener("pageshow", handlePageShow);

		return () => {
			document.removeEventListener("click", handleClick, true);
			window.removeEventListener("pageshow", handlePageShow);
		};
	}, []);

	useEffect(() => {
		if (!isLoading) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsLoading(false);
		}, 15000);

		return () => window.clearTimeout(timeout);
	}, [isLoading]);

	return isLoading ? <LoadingOverlay /> : null;
}

export function NavigationLoading() {
	return (
		<Suspense fallback={null}>
			<NavigationLoadingInner />
		</Suspense>
	);
}
