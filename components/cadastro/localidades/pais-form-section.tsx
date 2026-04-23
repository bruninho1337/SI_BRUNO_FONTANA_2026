import { createPaisAction } from "@/app/cadastro/localidades/actions";
import { ActiveToggle } from "@/components/active-toggle";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const camposPais = [
	{
		id: "pais",
		label: "Nome do País",
		placeholder: "Ex: Brasil",
		type: "text",
	},
	{
		id: "sigla-pais",
		label: "Sigla",
		placeholder: "Ex: BR",
		type: "text",
	},
	{
		id: "ddi-pais",
		label: "DDI",
		placeholder: "Ex: 55",
		type: "text",
	},
	{
		id: "moeda-pais",
		label: "Moeda",
		placeholder: "Ex: BRL",
		type: "text",
	},
];

type PaisFormSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string }>;
};

export async function PaisFormSection({ searchParams }: PaisFormSectionProps) {
	const params = await searchParams;

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-neutral-900">Dados do País</h2>
				<p className="mt-1 text-sm text-neutral-500">
					Os campos automáticos do banco permanecem fora do formulário.
				</p>
			</div>

			<FormFeedback params={params} />

			<form action={createPaisAction} className="space-y-4">
				{camposPais.map((campo) => (
					<div key={campo.id} className="flex flex-col gap-2">
						<Label htmlFor={campo.id} className="text-sm text-neutral-800">
							{campo.label}:
						</Label>
						<Input
							id={campo.id}
							name={campo.id.replace("-pais", "")}
							type={campo.type}
							placeholder={campo.placeholder}
							className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
						/>
					</div>
				))}

				<ActiveToggle name="ativo" />

				<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					Salvar país
				</Button>
			</form>
		</div>
	);
}
