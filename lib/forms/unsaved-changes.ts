export const UNSAVED_CHANGES_MESSAGE = "Você tem alterações não salvas. Deseja sair e descartar essas alterações?";
const CHECK_EVENT = "forms:check-unsaved";
const HISTORY_INDEX = "__formHistoryIndex";

function formSnapshot(form: HTMLFormElement) {
	return JSON.stringify(Array.from(form.elements).flatMap<unknown[]>((element) => {
		if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) return [];
		if (element.name === "_form_error_url" || element.name.startsWith("$ACTION_")) return [];
		if (element instanceof HTMLInputElement) {
			if (["submit", "button", "reset"].includes(element.type) || (element.readOnly && element.type !== "hidden")) return [];
			if (element.type === "checkbox" || element.type === "radio") return [[element.name, element.type, element.value, element.checked]];
			if (element.type === "file") return [[element.name, Array.from(element.files ?? []).map((file) => [file.name, file.size, file.lastModified])]];
		}
		if (element instanceof HTMLTextAreaElement && element.readOnly) return [];
		return [[element.name || element.id, element instanceof HTMLSelectElement && element.multiple ? Array.from(element.selectedOptions).map((option) => option.value) : element.value]];
	}));
}

export function trackUnsavedForm(form: HTMLFormElement) {
	let baseline = formSnapshot(form);
	let interacted = false;
	let pending = false;
	let restored = false;
	let disposed = false;
	function update() {
		if (disposed) return;
		const snapshot = formSnapshot(form);
		if (!interacted) baseline = snapshot;
		form.dataset.unsavedChanges = String(!pending && (restored || snapshot !== baseline));
	}
	function startInteraction() {
		if (!interacted) { baseline = formSnapshot(form); interacted = true; }
	}
	function changed() { interacted = true; queueMicrotask(update); }
	function reset() { queueMicrotask(() => { restored = false; baseline = formSnapshot(form); update(); }); }
	function draftRestored() { interacted = true; restored = true; update(); }
	const observer = new MutationObserver(() => queueMicrotask(update));
	observer.observe(form, { subtree: true, childList: true, attributes: true, attributeFilter: ["value", "checked"] });
	form.addEventListener("focusin", startInteraction);
	form.addEventListener("pointerdown", startInteraction);
	form.addEventListener("click", startInteraction, true);
	form.addEventListener("beforeinput", startInteraction);
	form.addEventListener("input", changed);
	form.addEventListener("change", changed);
	form.addEventListener("reset", reset);
	form.addEventListener("forms:draft-restored", draftRestored);
	document.addEventListener(CHECK_EVENT, update);
	update();
	return {
		setPending(value: boolean) { pending = value; update(); },
		dispose() {
			disposed = true;
			observer.disconnect();
			form.removeEventListener("focusin", startInteraction);
			form.removeEventListener("pointerdown", startInteraction);
			form.removeEventListener("click", startInteraction, true);
			form.removeEventListener("beforeinput", startInteraction);
			form.removeEventListener("input", changed);
			form.removeEventListener("change", changed);
			form.removeEventListener("reset", reset);
			form.removeEventListener("forms:draft-restored", draftRestored);
			document.removeEventListener(CHECK_EVENT, update);
			delete form.dataset.unsavedChanges;
		},
	};
}

export function hasUnsavedChanges(doc: Document): boolean {
	doc.dispatchEvent(new Event(CHECK_EVENT));
	if (doc.querySelector('form[data-unsaved-changes="true"]')) return true;
	return Array.from(doc.querySelectorAll("iframe")).some((frame) => {
		try { return frame.contentDocument ? hasUnsavedChanges(frame.contentDocument) : false; }
		catch { return false; } // Apenas os cadastros da mesma origem são inspecionados.
	});
}

export function confirmDiscardChanges(documents: Document[]) {
	return !documents.some(hasUnsavedChanges) || window.confirm(UNSAVED_CHANGES_MESSAGE);
}

function routeKey(href: string) {
	const url = new URL(href, window.location.href);
	url.searchParams.delete("success");
	url.searchParams.delete("error");
	return url.origin + url.pathname + "?" + url.searchParams.toString();
}

// Intercepta links antes do Next e restaura a entrada do histórico quando a saída é recusada.
export function installUnsavedNavigationGuard() {
	const originalPush = window.history.pushState;
	const originalReplace = window.history.replaceState;
	let index = Number(window.history.state?.[HISTORY_INDEX] ?? 0);
	let currentHref = window.location.href;
	let restoring = false;
	let approvedUntil = 0;
	const approve = () => { approvedUntil = Date.now() + 1500; };
	const isApproved = () => Date.now() < approvedUntil;
	originalReplace.call(window.history, { ...window.history.state, [HISTORY_INDEX]: index }, "");
	const push: History["pushState"] = function (data, unused, url) {
		originalPush.call(window.history, { ...data, [HISTORY_INDEX]: index + 1 }, unused, url);
		index++;
		currentHref = window.location.href;
		approvedUntil = 0;
	};
	const replace: History["replaceState"] = function (data, unused, url) {
		originalReplace.call(window.history, { ...data, [HISTORY_INDEX]: index }, unused, url);
		currentHref = window.location.href;
	};
	window.history.pushState = push;
	window.history.replaceState = replace;
	function click(event: MouseEvent) {
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
		if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
		if (routeKey(anchor.href) === routeKey(window.location.href)) return;
		if (!confirmDiscardChanges([document])) {
			event.preventDefault();
			event.stopImmediatePropagation();
		} else { approve(); }
	}
	function beforeUnload(event: BeforeUnloadEvent) {
		if (!isApproved() && hasUnsavedChanges(document)) { event.preventDefault(); event.returnValue = ""; }
	}
	function popState(event: PopStateEvent) {
		if (restoring) { restoring = false; event.stopImmediatePropagation(); return; }
		const nextIndex = Number(event.state?.[HISTORY_INDEX] ?? index - 1);
		if (routeKey(currentHref) !== routeKey(window.location.href) && !confirmDiscardChanges([document])) {
			event.stopImmediatePropagation();
			restoring = true;
			window.history.go(index - nextIndex || 1);
			return;
		}
		index = nextIndex;
		currentHref = window.location.href;
	}
	function pageShow() { approvedUntil = 0; }
	window.addEventListener("click", click, true);
	window.addEventListener("popstate", popState, true);
	if (window.parent === window) window.addEventListener("beforeunload", beforeUnload);
	window.addEventListener("pageshow", pageShow);
	return () => {
		window.removeEventListener("click", click, true);
		window.removeEventListener("popstate", popState, true);
		window.removeEventListener("beforeunload", beforeUnload);
		window.removeEventListener("pageshow", pageShow);
		if (window.history.pushState === push) window.history.pushState = originalPush;
		if (window.history.replaceState === replace) window.history.replaceState = originalReplace;
	};
}
