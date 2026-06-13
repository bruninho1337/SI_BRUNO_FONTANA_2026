import {
	createCondicaoPagamentoAction,
	updateCondicaoPagamentoAction,
} from "@/app/cadastro/condicoes-pagamento/actions";
import { ActiveToggle } from "@/components/forms/active-toggle";
import { AuditDates } from "@/components/cadastro/audit-dates";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { ParcelasCondicaoFields } from "@/components/cadastro/condicoes-pagamento/parcelas-condicao-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import {
	buscarCondicaoPagamentoPorId,
	listarParcelasCondicaoPagamento,
} from "@/lib/data/condicoes-pagamento";
import { listarFormasPagamentoParaSelecao } from "@/lib/data/formas-pagamento";

type CondicaoPagamentoFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

const inputClass = "h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900";
const readOnlyInputClass = "h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600";
const fieldClass = "flex flex-col gap-2";

export async function CondicaoPagamentoFormSection({
	searchParams,
}: CondicaoPagamentoFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const [
		{ data: condicaoEditando },
		{ data: parcelasCondicao },
		{ data: formasPagamento, error: formasPagamentoError },
	] = await Promise.all([
			Number.isNaN(editId) ? Promise.resolve({ data: null }) : buscarCondicaoPagamentoPorId(editId),
			Number.isNaN(editId)
				? Promise.resolve({ data: [] })
				: listarParcelasCondicaoPagamento(editId),
			listarFormasPagamentoParaSelecao(),
		]);
	const formaPagamentoOptions =
		formasPagamento?.map((forma) => ({
			id: String(forma.codforma_pagamento),
			label: `${forma.forma_pagamento} (${forma.tipo})`,
		})) ?? [];

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{condicaoEditando ? "Editar Condição de Pagamento" : "Nova Condição de Pagamento"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Cadastre prazos, parcelas e ajustes financeiros para clientes.
				</p>
			</div>

			<FormFeedback params={params} />

			{formasPagamentoError ? (
				<p className="mb-4 text-sm text-red-600">
					Erro ao carregar formas de pagamento: {formasPagamentoError.message}
				</p>
			) : null}

			<form
				action={condicaoEditando ? updateCondicaoPagamentoAction : createCondicaoPagamentoAction}
				className="space-y-4"
			>
				<div className="grid gap-4 md:grid-cols-12">
					{condicaoEditando ? (
						<input
							type="hidden"
							name="codcondicao_pagamento"
							value={condicaoEditando.codcondicao_pagamento}
						/>
					) : null}

					<div className={`${fieldClass} md:col-span-2`}>
						<Label htmlFor="codcondicao-pagamento-display" className="text-sm text-neutral-800">
							Código:
						</Label>
						<Input
							id="codcondicao-pagamento-display"
							value={condicaoEditando?.codcondicao_pagamento ?? ""}
							readOnly
							className={readOnlyInputClass}
						/>
					</div>

					<ActiveToggle
						name="ativo"
						defaultValue={condicaoEditando?.ativo === "N" ? "N" : "S"}
						className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
					/>

					<div className={`${fieldClass} md:col-span-5`}>
						<RequiredLabel htmlFor="condicao_pagamento" className="text-sm text-neutral-800">
							Condição de Pagamento:
						</RequiredLabel>
						<Input
							id="condicao_pagamento"
							name="condicao_pagamento"
							type="text"
							minLength={2}
							maxLength={50}
							required
							placeholder="Ex: A vista, 30 dias, Parcelado 3x"
							defaultValue={condicaoEditando?.condicao_pagamento ?? ""}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-12">
					<div className={`${fieldClass} md:col-span-2`}>
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

					<div className={`${fieldClass} md:col-span-2`}>
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

					<div className={`${fieldClass} md:col-span-2`}>
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

				<ParcelasCondicaoFields
					formaPagamentoOptions={formaPagamentoOptions}
					initialParcelas={parcelasCondicao ?? undefined}
				/>

				<AuditDates
					createdAt={condicaoEditando?.data_criacao}
					updatedAt={condicaoEditando?.data_atualizacao}
				/>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{condicaoEditando ? "Atualizar condicao" : "Salvar condicao"}
				</Button>
			</form>
		</div>
	);
}
