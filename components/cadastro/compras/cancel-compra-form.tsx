"use client";

import { useId, useRef, useState } from "react";
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
	const titleId = useId();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		if (isOpen) return;
		event.preventDefault();
		setIsOpen(true);
	}

	return (
		<>
			<form ref={formRef} action={cancelCompraAction} onSubmit={handleSubmit}>
				<input type="hidden" name="modelo" value={modelo} />
				<input type="hidden" name="serie" value={serie} />
				<input type="hidden" name="numero_nota" value={numeroNota} />
				<input type="hidden" name="codfornecedor" value={codfornecedor} />
				<input type="hidden" name="_form_error_url" value="/cadastro/compras" />
				<Button
					type="submit"
					variant="outline"
					size="icon"
					disabled={disabled}
					className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
					title={disabled ? "Compra já cancelada" : "Cancelar compra"}
					aria-label={disabled ? "Compra já cancelada" : "Cancelar compra"}
				>
					<Ban className="h-4 w-4" aria-hidden="true" />
				</Button>
			</form>

			{isOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
					<div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
						<div className="flex items-start gap-4">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
								<Ban className="h-5 w-5" aria-hidden="true" />
							</div>
							<div>
								<h2 id={titleId} className="text-lg font-semibold text-neutral-900">Cancelar compra?</h2>
								<p className="mt-2 text-sm leading-6 text-neutral-600">
									A compra permanecerá no histórico e as quantidades recebidas serão retiradas do estoque.
								</p>
							</div>
						</div>

						<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<Button type="button" variant="outline" className="h-10 rounded-xl border-neutral-300" onClick={() => setIsOpen(false)}>
								Voltar
							</Button>
							<Button type="button" className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={() => formRef.current?.requestSubmit()}>
								Confirmar cancelamento
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
