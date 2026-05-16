"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteConfirmFormProps = {
	action: (formData: FormData) => Promise<void>;
	idName: string;
	idValue: number | string;
};

export function DeleteConfirmForm({
	action,
	idName,
	idValue,
}: DeleteConfirmFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		if (isOpen) {
			return;
		}

		event.preventDefault();
		setIsOpen(true);
	}

	function handleConfirm() {
		formRef.current?.requestSubmit();
	}

	return (
		<>
			<form ref={formRef} action={action} onSubmit={handleSubmit}>
				<input type="hidden" name={idName} value={idValue} />
				<Button
					type="submit"
					variant="outline"
					size="icon"
					className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
					title="Excluir"
					aria-label="Excluir registro"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				</Button>
			</form>

			{isOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
					aria-labelledby="delete-confirm-title"
				>
					<div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
						<div className="flex items-start gap-4">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
								<Trash2 className="h-5 w-5" aria-hidden="true" />
							</div>
							<div>
								<h2 id="delete-confirm-title" className="text-lg font-semibold text-neutral-900">
									Confirmar exclusão
								</h2>
								<p className="mt-2 text-sm leading-6 text-neutral-600">
									Tem certeza que deseja excluir este registro? Essa ação nao pode ser desfeita.
								</p>
							</div>
						</div>

						<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="outline"
								className="h-10 rounded-xl border-neutral-300"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								type="button"
								className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700"
								onClick={handleConfirm}
							>
								Confirmar
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
