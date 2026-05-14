import Link from "next/link";
import { Edit, Plus, Search } from "lucide-react";

import { DeleteConfirmForm } from "@/components/cadastro/delete-confirm-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CadastroListToolbarProps = {
	title: string;
	count: number;
	createHref: string;
	searchValue?: string;
	searchPlaceholder: string;
};

type CadastroRowActionsProps = {
	editHref: string;
	deleteAction: (formData: FormData) => Promise<void>;
	idName: string;
	idValue: number | string;
};

export function CadastroListToolbar({
	title,
	count,
	createHref,
	searchValue = "",
	searchPlaceholder,
}: CadastroListToolbarProps) {
	return (
		<div className="mb-5 space-y-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
					<span className="text-sm text-neutral-500">{count} registro(s)</span>
				</div>

				<Button asChild className="h-10 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
					<Link href={createHref}>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Novo
					</Link>
				</Button>
			</div>

			<form className="flex flex-col gap-2 md:flex-row" action="">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
					<Input
						name="q"
						defaultValue={searchValue}
						placeholder={searchPlaceholder}
						className="h-11 rounded-xl border-neutral-300 bg-white pl-10 text-neutral-900"
					/>
				</div>
				<Button type="submit" variant="outline" className="h-11 rounded-xl border-neutral-300">
					Pesquisar
				</Button>
			</form>
		</div>
	);
}

export function CadastroRowActions({
	editHref,
	deleteAction,
	idName,
	idValue,
}: CadastroRowActionsProps) {
	return (
		<div className="flex items-center justify-end gap-2">
			<Button asChild variant="outline" size="icon" className="rounded-xl border-neutral-300" title="Editar">
				<Link href={editHref} aria-label="Editar registro">
					<Edit className="h-4 w-4" aria-hidden="true" />
				</Link>
			</Button>
			<DeleteConfirmForm action={deleteAction} idName={idName} idValue={idValue} />
		</div>
	);
}
