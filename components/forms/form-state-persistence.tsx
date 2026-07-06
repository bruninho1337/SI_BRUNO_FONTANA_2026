"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type FormStatePersistenceProps = {
	formKey: string;
};

type DraftValue = string | string[];
type FormDraft = Record<string, DraftValue>;

function valuesByName(formData: FormData) {
	const draft: FormDraft = {};

	for (const [name, value] of formData.entries()) {
		if (name === "_form_error_url" || value instanceof File) {
			continue;
		}

		const textValue = String(value);
		const current = draft[name];

		if (Array.isArray(current)) {
			current.push(textValue);
		} else if (current !== undefined) {
			draft[name] = [current, textValue];
		} else {
			draft[name] = textValue;
		}
	}

	return draft;
}

function valueAt(value: DraftValue | undefined, index: number) {
	if (Array.isArray(value)) {
		return value[index] ?? "";
	}

	return index === 0 ? value ?? "" : "";
}

function setNativeValue(
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	value: string
) {
	const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
	const prototype = Object.getPrototypeOf(element) as
		| HTMLInputElement
		| HTMLSelectElement
		| HTMLTextAreaElement;
	const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

	if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
		prototypeValueSetter.call(element, value);
	} else if (valueSetter) {
		valueSetter.call(element, value);
	} else {
		element.value = value;
	}
}

function setNativeChecked(element: HTMLInputElement, checked: boolean) {
	const checkedSetter = Object.getOwnPropertyDescriptor(element, "checked")?.set;
	const prototypeCheckedSetter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"checked"
	)?.set;

	if (prototypeCheckedSetter && checkedSetter !== prototypeCheckedSetter) {
		prototypeCheckedSetter.call(element, checked);
	} else if (checkedSetter) {
		checkedSetter.call(element, checked);
	} else {
		element.checked = checked;
	}
}

export function FormStatePersistence({ formKey }: FormStatePersistenceProps) {
	const markerRef = useRef<HTMLInputElement>(null);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const cleanUrl = useMemo(() => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("success");
		params.delete("error");

		return params.toString() ? `${pathname}?${params.toString()}` : pathname;
	}, [pathname, searchParams]);
	const storageKey = useMemo(() => `form-draft:${formKey}:${cleanUrl}`, [formKey, cleanUrl]);
	const hasError = searchParams.has("error");

	useEffect(() => {
		const form = markerRef.current?.closest("form");

		if (!form) {
			return;
		}

		const currentForm = form;

		function handleSubmit() {
			sessionStorage.setItem(storageKey, JSON.stringify(valuesByName(new FormData(currentForm))));
		}

		form.addEventListener("submit", handleSubmit);

		return () => {
			form.removeEventListener("submit", handleSubmit);
		};
	}, [storageKey]);

	useEffect(() => {
		const form = markerRef.current?.closest("form");

		if (!form) {
			return;
		}

		if (!hasError) {
			sessionStorage.removeItem(storageKey);
			return;
		}

		const rawDraft = sessionStorage.getItem(storageKey);

		if (!rawDraft) {
			return;
		}

		let draft: FormDraft;

		try {
			draft = JSON.parse(rawDraft) as FormDraft;
		} catch {
			sessionStorage.removeItem(storageKey);
			return;
		}

		const nameIndexes = new Map<string, number>();
		const elements = Array.from(form.elements) as Array<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>;

		for (const element of elements) {
			const { name } = element;

			if (!name || name === "_form_error_url") {
				continue;
			}

			const index = nameIndexes.get(name) ?? 0;
			nameIndexes.set(name, index + 1);
			const nextValue = valueAt(draft[name], index);

			if (element instanceof HTMLInputElement && element.type === "checkbox") {
				setNativeChecked(
					element,
					Array.isArray(draft[name])
						? draft[name].includes(element.value)
						: draft[name] === element.value
				);
			} else if (element instanceof HTMLInputElement && element.type === "radio") {
				setNativeChecked(element, nextValue === element.value);
			} else {
				setNativeValue(element, nextValue);
			}

			element.dispatchEvent(new Event("input", { bubbles: true }));
			element.dispatchEvent(new Event("change", { bubbles: true }));
		}

		window.dispatchEvent(new CustomEvent("form-draft-restored", { detail: draft }));
	}, [hasError, storageKey]);

	return <input ref={markerRef} type="hidden" name="_form_error_url" value={cleanUrl} readOnly />;
}
