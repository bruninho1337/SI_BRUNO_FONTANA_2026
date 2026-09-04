"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ChevronDown, Pencil, Plus, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { cn } from "@/lib/shared/utils";

type Option = {
	id: string;
	label: string;
};

type SearchableSelectProps = {
	name: string;
	id?: string;
	label: string;
	searchLabel: string;
	searchPlaceholder: string;
	selectPlaceholder: string;
	options: Option[];
	required?: boolean;
	disabled?: boolean;
	defaultValue?: string;
	value?: string;
	className?: string;
	createHref?: string;
	createLabel?: string;
	error?: string;
	onValueChange?: (value: string) => void;
};

export function SearchableSelect({
	name,
	id,
	label,
	searchLabel,
	searchPlaceholder,
	selectPlaceholder,
	options,
	required = false,
	disabled = false,
	defaultValue = "",
	value,
	className,
	createHref,
	createLabel = "Adicionar",
	error,
	onValueChange,
}: SearchableSelectProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const fieldId = id ?? name;
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState(defaultValue);
	const currentValue = value ?? selectedId;

	const filteredOptions = useMemo(() => {
		const term = search.trim().toLowerCase();

		if (!term) {
			return options;
		}

		return options.filter((option) =>
			option.label.toLowerCase().includes(term)
		);
	}, [options, search]);

	const selectedOption = useMemo(
		() => options.find((option) => option.id === currentValue),
		[options, currentValue]
	);

	useEffect(() => {
		if (value !== undefined) {
			setSelectedId(value);
		}
	}, [value]);

	useEffect(() => {
		function handleDraftRestored() {
			const nextValue = inputRef.current?.value;

			if (nextValue !== undefined) {
				setSelectedId(nextValue);
				onValueChange?.(nextValue);
			}
		}

		window.addEventListener("form-draft-restored", handleDraftRestored);

		return () => {
			window.removeEventListener("form-draft-restored", handleDraftRestored);
		};
	}, [onValueChange]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.setTimeout(() => searchInputRef.current?.focus(), 0);

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	function getEditHref(optionId: string) {
		if (!createHref) {
			return undefined;
		}

		const [path] = createHref.split("?");

		return `${path}?edit=${encodeURIComponent(optionId)}`;
	}

	return (
		<div ref={containerRef} className={cn("space-y-2", className)}>
			{required ? (
				<RequiredLabel htmlFor={`${fieldId}-trigger`} className="text-sm text-neutral-800">
					{label}:
				</RequiredLabel>
			) : (
				<Label htmlFor={`${fieldId}-trigger`} className="text-sm text-neutral-800">
					{label}:
				</Label>
			)}
			<input ref={inputRef} name={name} value={currentValue} required={required} disabled={disabled} type="hidden" readOnly />
			<button
				id={`${fieldId}-trigger`}
				type="button"
				disabled={disabled}
				data-invalid={error ? "true" : undefined}
				aria-describedby={error ? `${fieldId}-error` : undefined}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				onClick={() => setIsOpen(true)}
				className={cn(
					"flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 disabled:opacity-100",
					error ? "border-red-500 focus-visible:ring-red-500" : "border-neutral-300"
				)}
			>
				<span className={selectedOption ? "text-neutral-900" : "text-neutral-500"}>
					{selectedOption?.label ?? selectPlaceholder}
				</span>
				<span className="text-neutral-500">
					<ChevronDown className="h-4 w-4" aria-hidden="true" />
				</span>
			</button>
			{error ? (
				<p id={`${fieldId}-error`} className="text-sm text-red-600">
					{error}
				</p>
			) : null}

			{isOpen && typeof document !== "undefined" ? createPortal(
				<div
					className="fixed inset-0 z-[1000] flex min-h-dvh w-screen items-center justify-center bg-neutral-950/40 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`${fieldId}-dialog-title`}
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setIsOpen(false);
						}
					}}
				>
					<div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
						<div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
							<div className="min-w-0">
								<h2 id={`${fieldId}-dialog-title`} className="text-base font-semibold text-neutral-900">
									{label}
								</h2>
								<p className="mt-1 text-sm text-neutral-500">
									{selectedOption?.label ?? selectPlaceholder}
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								{createHref ? (
									<Link
										href={createHref}
										aria-label={createLabel}
										title={createLabel}
										className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									>
										<Plus className="h-4 w-4" aria-hidden="true" />
										<span>Novo</span>
									</Link>
								) : null}
								<button
									type="button"
									aria-label="Fechar"
									title="Fechar"
									onClick={() => setIsOpen(false)}
									className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<X className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						</div>

						<div className="border-b border-neutral-200 px-5 py-4">
							<Label htmlFor={`${fieldId}-search`} className="text-xs text-neutral-500">
								{searchLabel}
							</Label>
							<div className="relative mt-2">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
								<Input
									ref={searchInputRef}
									id={`${fieldId}-search`}
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder={searchPlaceholder}
									className="h-11 rounded-md border-neutral-300 bg-white pl-10 pr-4 text-neutral-900"
								/>
							</div>
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto p-3">
							{filteredOptions.length > 0 ? (
								<div className="divide-y divide-neutral-100">
									{filteredOptions.map((option) => {
										const isSelected = option.id === currentValue;
										const editHref = getEditHref(option.id);

										return (
											<div
												key={option.id}
												className={cn(
													"grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md px-2 py-2",
													isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"
												)}
											>
												<button
													type="button"
													onClick={() => {
														setSelectedId(option.id);
														onValueChange?.(option.id);
														setSearch("");
														setIsOpen(false);
													}}
													className="min-w-0 rounded-md px-3 py-2 text-left text-sm text-neutral-900 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
												>
													<span className="block truncate">{option.label}</span>
												</button>
												{isSelected ? (
													<span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white" title="Selecionado">
														<Check className="h-4 w-4" aria-hidden="true" />
													</span>
												) : (
													<button
														type="button"
														onClick={() => {
															setSelectedId(option.id);
															onValueChange?.(option.id);
															setSearch("");
															setIsOpen(false);
														}}
														className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
													>
														Selecionar
													</button>
												)}
												{editHref ? (
													<Link
														href={editHref}
														aria-label={`Editar ${option.label}`}
														title={`Editar ${option.label}`}
														className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
													>
														<Pencil className="h-4 w-4" aria-hidden="true" />
													</Link>
												) : null}
											</div>
										);
									})}
								</div>
							) : (
								<p className="px-2 py-8 text-center text-sm text-neutral-500">
									Nenhum resultado encontrado.
								</p>
							)}
						</div>

						<div className="flex justify-end border-t border-neutral-200 px-5 py-4">
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								Fechar
							</button>
						</div>
					</div>
				</div>,
				document.body
			) : null}
		</div>
	);
}
