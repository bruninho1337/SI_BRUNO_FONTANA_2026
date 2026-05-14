import { deleteEstadoAction } from "@/app/cadastro/localidades/actions";
import { CadastroListToolbar, CadastroRowActions } from "@/components/cadastro/cadastro-list-actions";
import { FormFeedback } from "@/components/cadastro/form-feedback";
import { listarEstadosComPaises } from "@/lib/localidades";

type EstadosListSectionProps = {
	searchParams?: Promise<{ success?: string; error?: string; q?: string }>;
};

export async function EstadosListSection({ searchParams }: EstadosListSectionProps) {
	const params = await searchParams;
	const query = String(params?.q ?? "").trim().toLowerCase();
	const { paises, estados, error } = await listarEstadosComPaises();
	const paisMap = new Map((paises ?? []).map((pais) => [pais.codpais, pais.pais]));
	const filtered = (estados ?? []).filter((estado) =>
		[estado.uf, estado.estado, paisMap.get(estado.codpais)].some((value) =>
			String(value ?? "").toLowerCase().includes(query)
		)
	);

	return (
		<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
			<CadastroListToolbar
				title="Estados cadastrados"
				count={filtered.length}
				createHref="/cadastro/localidades/estados?mode=create"
				searchValue={params?.q}
				searchPlaceholder="Pesquisar por UF, estado ou pais"
			/>
			<FormFeedback params={params} />

			{error ? (
				<p className="text-sm text-red-600">Erro ao carregar estados: {error.message}</p>
			) : filtered.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-3">
						<thead>
							<tr className="text-left text-sm text-neutral-500">
								<th className="pb-2 font-medium">UF</th>
								<th className="pb-2 font-medium">Estado</th>
								<th className="pb-2 font-medium">Pais</th>
								<th className="pb-2 font-medium">Ativo</th>
								<th className="pb-2 text-right font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((estado) => (
								<tr key={estado.codestado} className="bg-neutral-50">
									<td className="rounded-l-xl px-4 py-3 text-sm font-semibold text-neutral-900">{estado.uf}</td>
									<td className="px-4 py-3 text-sm text-neutral-900">{estado.estado}</td>
									<td className="px-4 py-3 text-sm text-neutral-700">{paisMap.get(estado.codpais) ?? "-"}</td>
									<td className="px-4 py-3 text-sm font-semibold text-neutral-900">{estado.ativo}</td>
									<td className="rounded-r-xl px-4 py-3">
										<CadastroRowActions
											editHref={`/cadastro/localidades/estados?edit=${estado.codestado}`}
											deleteAction={deleteEstadoAction}
											idName="codestado"
											idValue={estado.codestado}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-sm text-neutral-500">Nenhum estado encontrado.</p>
			)}
		</div>
	);
}
