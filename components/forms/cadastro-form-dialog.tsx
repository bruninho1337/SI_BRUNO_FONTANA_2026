"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";

type CadastroFormDialogProps = {
	href: string;
	title: string;
	onClose: () => void;
	onSaved: () => void;
};

type CadastroScreen = { id: number; href: string; title: string };

function embeddedHref(href: string) {
	const url = new URL(href, window.location.origin);
	if (url.origin !== window.location.origin || !url.pathname.startsWith("/cadastro/")) return null;
	url.searchParams.set("embedded", "1");
	return url.pathname + url.search;
}

export function CadastroFormDialog({ href, title, onClose, onSaved }: CadastroFormDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const frames = useRef(new Map<number, HTMLIFrameElement>());
	const closeRef = useRef<HTMLButtonElement>(null);
	const nextId = useRef(1);
	const titleId = useId();
	const [screens, setScreens] = useState<CadastroScreen[]>(() => [{ id: 0, href, title }]);
	const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
	const active = screens[screens.length - 1];
	const goBack = useCallback((saved = false) => {
		if (screens.length === 1) {
			if (saved) onSaved();
			else onClose();
			return;
		}
		const previous = screens[screens.length - 2];
		setScreens(screens.slice(0, -1));
		setLoaded((current) => {
			const remaining = new Set(current);
			remaining.delete(active.id);
			return remaining;
		});
		if (saved) frames.current.get(previous.id)?.contentWindow?.postMessage({ type: "cadastro:refresh" }, window.location.origin);
	}, [screens, active.id, onClose, onSaved]);

	useEffect(() => {
		const previousFocus = document.activeElement as HTMLElement | null;
		closeRef.current?.focus();
		function keepFocusInside(event: FocusEvent) {
			if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) closeRef.current?.focus();
		}
		document.addEventListener("focusin", keepFocusInside);
		return () => {
			document.removeEventListener("focusin", keepFocusInside);
			previousFocus?.focus();
		};
	}, []);

	useEffect(() => {
		function handleMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin || event.source !== frames.current.get(active.id)?.contentWindow) return;
			if (event.data?.type === "cadastro:saved") goBack(true);
			if (event.data?.type === "cadastro:close") goBack();
			if (event.data?.type === "cadastro:open" && typeof event.data.href === "string" && typeof event.data.title === "string") {
				const nestedHref = embeddedHref(event.data.href);
				if (!nestedHref) return;
				setScreens((current) => [...current, { id: nextId.current++, href: nestedHref, title: event.data.title }]);
			}
		}
		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [active.id, goBack]);

	return createPortal(
		<div ref={dialogRef} className="fixed inset-0 z-[1100] flex items-center justify-center bg-neutral-950/50 p-3 sm:p-6"
			role="dialog" aria-modal="true" aria-labelledby={titleId}
			onMouseDown={(event) => { event.stopPropagation(); }}
			onKeyDown={(event) => {
				event.stopPropagation();
				if (event.key === "Escape") goBack();
				if (event.key === "Tab" && event.target === dialogRef.current?.querySelector("button") && event.shiftKey) {
					event.preventDefault();
					frames.current.get(active.id)?.focus();
				}
			}}>
			<div className="flex h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl">
				<div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
					<div className="flex min-w-0 items-center gap-3">
						{screens.length > 1 && <button type="button" onClick={() => goBack()} aria-label="Voltar ao cadastro anterior"
							className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-neutral-300 px-3 text-sm hover:bg-neutral-100">
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar
						</button>}
						<h2 id={titleId} className="truncate text-lg font-semibold text-neutral-900">{active.title}</h2>
					</div>
					<button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar cadastro"
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-300 hover:bg-neutral-100">
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
				{!loaded.has(active.id) && <p role="status" className="px-5 py-3 text-sm text-neutral-500">Carregando formulário...</p>}
				{/* Mantém os formulários anteriores montados para preservar dados e rolagem. */}
				{screens.map((screen) => <iframe key={screen.id}
					ref={(frame) => { if (frame) frames.current.set(screen.id, frame); else frames.current.delete(screen.id); }}
					name="cadastro-embedded" src={embeddedHref(screen.href) ?? undefined} title={screen.title}
					hidden={screen.id !== active.id} inert={screen.id !== active.id}
					onLoad={() => setLoaded((current) => new Set(current).add(screen.id))}
					className={screen.id === active.id ? "min-h-0 w-full flex-1 border-0 bg-white" : "hidden"} />)}
			</div>
		</div>, document.body,
	);
}
