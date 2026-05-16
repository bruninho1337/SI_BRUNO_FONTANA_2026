import { createPaisAction, updatePaisAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { buscarPaisPorId } from "@/lib/localidades";

const camposPais = [
	{ id: "pais", label: "Pais", placeholder: "Ex: Brasil", type: "text", maxLength: 60, className: "md:col-span-4" },
	{ id: "sigla", label: "Sigla", placeholder: "Ex: BR", type: "text", maxLength: 5, className: "md:col-span-2" },
	{ id: "ddi", label: "DDI", placeholder: "Ex: 55", type: "text", maxLength: 5, className: "md:col-span-2" },
	{ id: "moeda", label: "Moeda", placeholder: "Ex: BRL", type: "text", maxLength: 10, className: "md:col-span-2" },
];

const fieldClass = "flex flex-col gap-2";

type PaisFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; edit?: string }>;
};

export async function PaisFormSection({ searchParams }: PaisFormSectionProps) {
	const params = await searchParams;
	const editId = Number(params?.edit ?? "");
	const { data: paisEditando } = Number.isNaN(editId)
		? { data: null }
		: await buscarPaisPorId(editId);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">
					{paisEditando ? "Editar Pais" : "Novo Pais"}
				</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Os campos automaticos do banco permanecem fora do formulario.
				</p>
			</div>

			<FormFeedback params={params} />

			<form action={paisEditando ? updatePaisAction : createPaisAction} className="space-y-4">
				<div className="grid gap-4 md:grid-cols-12">
				{paisEditando ? (
					<>
						<input type="hidden" name="codpais" value={paisEditando.codpais} />
						<div className={`${fieldClass} md:col-span-2`}>
							<Label htmlFor="codpais-display" className="text-sm text-neutral-800">
								Codigo:
							</Label>
							<Input
								id="codpais-display"
								value={paisEditando.codpais}
								readOnly
								className="h-11 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-neutral-600"
							/>
						</div>
					</>
				) : null}

				<ActiveToggle
					name="ativo"
					defaultValue={paisEditando?.ativo === "N" ? "N" : "S"}
					className="w-fit md:col-span-2 md:col-start-11 md:row-start-1 md:justify-self-end"
				/>

				{camposPais.map((campo) => (
					<div key={campo.id} className={`${fieldClass} ${campo.className}`}>
						{campo.id === "pais" ? (
							<RequiredLabel htmlFor={campo.id} className="text-sm text-neutral-800">
								{campo.label}:
							</RequiredLabel>
						) : (
							<Label htmlFor={campo.id} className="text-sm text-neutral-800">
								{campo.label}:
							</Label>
						)}
						<Input
							id={campo.id}
							name={campo.id}
							type={campo.type}
							maxLength={campo.maxLength}
							required={campo.id === "pais"}
							placeholder={campo.placeholder}
							defaultValue={String(paisEditando?.[campo.id as keyof typeof paisEditando] ?? "")}
							className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
						/>
					</div>
				))}
				</div>

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					{paisEditando ? "Atualizar pais" : "Salvar pais"}
				</Button>
			</form>
		</div>
	);
}
