import {
	createCondicaoPagamentoAction,
	updateCondicaoPagamentoAction,
} from "@/app/cadastro/condicoes-pagamento/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarCondicaoPagamentoPorId } from "@/lib/condicoes-pagamento";

type CondicaoPagamentoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900";
const fieldClass = "flex flex-col gap-2";

export async function CondicaoPagamentoFormSection({
	searchParams,
}: CondicaoPagamentoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: condicaoEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarCondicaoPagamentoPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{condicaoEditando ? "Editar Condicao de Pagamento" : "Nova Condicao de Pagamento"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre prazos, parcelas e ajustes financeiros para clientes.
				</p>
			</div>

			<FormFeedback params={params} />

			<form
				action={condicaoEditando ? updateCondicaoPagamentoAction : createCondicaoPagamentoAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{condicaoEditando ? (
						<>
							<input
								type="hidden"
								name="codcondicao_pagamento"
								value={condicaoEditando.codcondicao_pagamento}
							/>
							<div className={`${fieldClass} md:col-span-2`}>
								<Label htmlFor="codcondicao-pagamento-display" className="text-sm text-neutral-800">
									Codigo:
								</Label>
								<Input
									id="codcondicao-pagamento-display"
									value={condicaoEditando.codcondicao_pagamento}
									readOnly
									className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
								/>
							</div>
						</>
					) : null}

					<ActiveToggle
						name="ativo"
						defaultValue={condicaoEditando?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>

					<div className={`${fieldClass} md:col-span-5`}>
						<RequiredLabel htmlFor="nome" className="text-sm text-neutral-800">
							Nome:
						</RequiredLabel>
						<Input
							id="nome"
							name="nome"
							type="text"
							minLength={2}
							maxLength={80}
							required
							placeholder="Ex: A vista, 30 dias, Parcelado 3x"
							defaultValue={condicaoEditando?.nome ?? ""}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="prazo_dias" className="text-sm text-neutral-800">
							Prazo:
						</RequiredLabel>
						<Input
							id="prazo_dias"
							name="prazo_dias"
							type="number"
							min={0}
							required
							placeholder="Ex: 30"
							defaultValue={String(condicaoEditando?.prazo_dias ?? 0)}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-2`}>
						<RequiredLabel htmlFor="parcelas" className="text-sm text-neutral-800">
							Parcelas:
						</RequiredLabel>
						<Input
							id="parcelas"
							name="parcelas"
							type="number"
							min={1}
							required
							placeholder="Ex: 1"
							defaultValue={String(condicaoEditando?.parcelas ?? 1)}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="juro" className="text-sm text-neutral-800">
							Juro:
						</RequiredLabel>
						<Input
							id="juro"
							name="juro"
							type="text"
							required
							placeholder="Ex: 2,50"
							defaultValue={String(condicaoEditando?.juro ?? 0)}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="multa" className="text-sm text-neutral-800">
							Multa:
						</RequiredLabel>
						<Input
							id="multa"
							name="multa"
							type="text"
							required
							placeholder="Ex: 5,00"
							defaultValue={String(condicaoEditando?.multa ?? 0)}
							className={inputClass}
						/>
					</div>

					<div className={`${fieldClass} md:col-span-3`}>
						<RequiredLabel htmlFor="desconto" className="text-sm text-neutral-800">
							Desconto:
						</RequiredLabel>
						<Input
							id="desconto"
							name="desconto"
							type="text"
							required
							placeholder="Ex: 10,00"
							defaultValue={String(condicaoEditando?.desconto ?? 0)}
							className={inputClass}
						/>
					</div>
				</div>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{condicaoEditando ? "Atualizar condicao" : "Salvar condicao"}
				</Button>
			</form>
		</div>
	);
}
