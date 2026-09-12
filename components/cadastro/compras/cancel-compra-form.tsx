"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Ban } from "lucide-react";

import { cancelCompraAction } from "@/app/cadastro/compras/actions";
import { Button } from "@/components/ui/button";

type CancelCompraFormProps = {
	modelo: string;
	serie: string;
	numeroNota: string;
	codfornecedor: number | string;
	disabled?: boolean;
};

export function CancelCompraForm({ modelo, serie, numeroNota, codfornecedor, disabled = false }: CancelCompraFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const [motivo, setMotivo] = useState("");
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (isOpen) dialogRef.current?.showModal();
	}, [isOpen]);

	async function cancel(formData: FormData) {
		try { await cancelCompraAction(formData); }
		finally { setPending(false); setIsOpen(false); }
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		if (isOpen) { setPending(true); return; }
		event.preventDefault();
		setIsOpen(true);
	}

	return (
		<>
			<form id={titleId + "-form"} ref={formRef} action={cancel} onSubmit={handleSubmit}>
				<input type="hidden" name="modelo" value={modelo} />
				<input type="hidden" name="serie" value={serie} />
				<input type="hidden" name="numero_nota" value={numeroNota} />
				<input type="hidden" name="codfornecedor" value={codfornecedor} />
				<input type="hidden" name="_form_error_url" value={`/cadastro/compras?${new URLSearchParams({ edit: "1", modelo, serie, numero_nota: numeroNota, codfornecedor: String(codfornecedor) })}`} />
				<Button
					type="submit"
					variant="outline"
					disabled={disabled}
					className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
					title={disabled ? "Compra já cancelada" : "Cancelar compra"}
					aria-label={disabled ? "Compra já cancelada" : "Cancelar compra"}
				>
					<Ban className="h-4 w-4" aria-hidden="true" />Cancelar compra
				</Button>
			</form>

			{isOpen ? (
				<dialog ref={dialogRef} className="w-full max-w-md rounded-2xl bg-transparent p-0 backdrop:bg-neutral-950/45" aria-labelledby={titleId} onCancel={(event) => { if (pending) event.preventDefault(); else setIsOpen(false); }}>
					<div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
						<div className="flex items-start gap-4">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
								<Ban className="h-5 w-5" aria-hidden="true" />
							</div>
							<div>
								<h2 id={titleId} className="text-lg font-semibold text-neutral-900">Cancelar compra?</h2>
								<p className="mt-2 text-sm leading-6 text-neutral-600">
									A compra permanecerá no histórico. O estoque será revertido e as contas a pagar vinculadas serão canceladas.
								</p>
							</div>
						</div>

						<div className="mt-5 space-y-2">
							<label htmlFor={titleId + "-motivo"} className="block text-sm font-medium">Motivo do cancelamento *</label>
							<textarea autoFocus id={titleId + "-motivo"} form={titleId + "-form"} name="motivo_cancelamento" required maxLength={500} rows={4} value={motivo} onChange={(event) => setMotivo(event.target.value)} className="w-full rounded-xl border border-neutral-300 p-3 text-sm" />
						</div>
						<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<Button type="button" variant="outline" className="h-10 rounded-xl border-neutral-300" disabled={pending} onClick={() => setIsOpen(false)}>
								Voltar
							</Button>
							<Button type="button" className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700" disabled={pending || !motivo.trim()} onClick={() => formRef.current?.requestSubmit()}>
								Confirmar cancelamento
							</Button>
						</div>
					</div>
				</dialog>
			) : null}
		</>
	);
}
