import Link from "next/link";

import { DashboardCurrentDate } from "@/components/dashboard-current-date";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";

export default function BarbeiroDashboardPage() {
	const proximosAtendimentos = [
		{
			id: 1,
			cliente: "João Silva",
			servico: "Corte social",
			horario: "09:00",
			status: "Confirmado",
		},
		{
			id: 2,
			cliente: "Carlos Souza",
			servico: "Barba",
			horario: "10:00",
			status: "Aguardando",
		},
		{
			id: 3,
			cliente: "Pedro Lima",
			servico: "Corte + Barba",
			horario: "11:30",
			status: "Confirmado",
		},
		{
			id: 4,
			cliente: "Lucas Ferreira",
			servico: "Degradê",
			horario: "14:00",
			status: "Confirmado",
		},
	];

	const atendimentosHoje = [
		{
			id: 1,
			cliente: "João Silva",
			servico: "Corte social",
			horario: "09:00",
			valor: "R$ 35,00",
		},
		{
			id: 2,
			cliente: "Carlos Souza",
			servico: "Barba",
			horario: "10:00",
			valor: "R$ 25,00",
		},
		{
			id: 3,
			cliente: "Pedro Lima",
			servico: "Corte + Barba",
			horario: "11:30",
			valor: "R$ 55,00",
		},
	];

	function getStatusStyle(status: string) {
		switch (status) {
			case "Confirmado":
				return "bg-green-100 text-green-700";
			case "Aguardando":
				return "bg-yellow-100 text-yellow-700";
			case "Cancelado":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	}

	return (
		<div className="min-h-screen w-full overflow-x-hidden bg-neutral-100 p-4 sm:p-6 md:p-8">
			<div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 lg:flex-row">
				<DashboardSidebar />

				<div className="min-w-0 flex-1 space-y-8">
					<div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
						<div className="flex min-w-0 flex-col gap-2">
							<h1 className="break-words text-2xl font-bold text-neutral-900 md:text-3xl">
								Dashboard do Barbeiro
							</h1>
							<DashboardCurrentDate />
						</div>

						<Button
							asChild
							className="w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 md:w-auto"
						>
							<Link href="/cadastro/produtos-servicos">
								Cadastrar produto ou serviço
							</Link>
						</Button>
					</div>

					<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
							<p className="text-sm text-neutral-500">Atendimentos hoje</p>
							<h2 className="mt-2 text-3xl font-bold text-neutral-900">8</h2>
						</div>

						<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
							<p className="text-sm text-neutral-500">Próximo horário</p>
							<h2 className="mt-2 text-3xl font-bold text-neutral-900">09:00</h2>
						</div>

						<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
							<p className="text-sm text-neutral-500">Serviços concluídos</p>
							<h2 className="mt-2 text-3xl font-bold text-neutral-900">3</h2>
						</div>

						<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
							<p className="text-sm text-neutral-500">Faturamento do dia</p>
							<h2 className="mt-2 text-3xl font-bold text-neutral-900">R$ 115,00</h2>
						</div>
					</div>

					<div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
						<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6 xl:col-span-2">
							<div className="mb-5 flex items-center justify-between">
								<h2 className="text-xl font-semibold text-neutral-900">
									Próximos atendimentos
								</h2>
								<button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
									Ver agenda completa
								</button>
							</div>

							<div className="space-y-4">
								{proximosAtendimentos.map((item) => (
									<div
										key={item.id}
										className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"
									>
										<div>
											<p className="text-base font-semibold text-neutral-900">
												{item.cliente}
											</p>
											<p className="text-sm text-neutral-600">
												{item.servico}
											</p>
										</div>

										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-neutral-800">
												{item.horario}
											</span>
											<span
												className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
													item.status
												)}`}
											>
												{item.status}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
							<h2 className="text-xl font-semibold text-neutral-900">
								Ações rápidas
							</h2>

							<div className="mt-5 flex flex-col gap-3">
								<button className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90">
									Registrar serviço concluído
								</button>

								<button className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
									Ver clientes do dia
								</button>

								<button className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
									Consultar agenda
								</button>

								<Button
									asChild
									variant="outline"
									className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
								>
									<Link href="/cadastro/produtos-servicos">
										Ir para cadastro
									</Link>
								</Button>
							</div>
						</div>
					</div>

					<div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-neutral-900">
								Atendimentos de hoje
							</h2>
							<span className="text-sm text-neutral-500">
								{atendimentosHoje.length} registrados
							</span>
						</div>

						<div className="overflow-x-auto">
								<table className="min-w-full border-separate border-spacing-y-3">
									<thead>
										<tr className="text-left text-sm text-neutral-500">
											<th className="pb-2 font-medium">Horário</th>
											<th className="pb-2 font-medium">Cliente</th>
											<th className="pb-2 font-medium">Serviço</th>
											<th className="pb-2 font-medium">Valor</th>
										</tr>
									</thead>
									<tbody>
										{atendimentosHoje.map((item) => (
											<tr key={item.id} className="bg-neutral-50">
											<td className="rounded-l-xl px-4 py-3 text-sm text-neutral-800">
												{item.horario}
											</td>
											<td className="px-4 py-3 text-sm text-neutral-800">
												{item.cliente}
											</td>
											<td className="px-4 py-3 text-sm text-neutral-800">
												{item.servico}
											</td>
											<td className="rounded-r-xl px-4 py-3 text-sm font-semibold text-neutral-900">
												{item.valor}
											</td>
										</tr>
										))}
									</tbody>
								</table>
							</div>
					</div>
				</div>
			</div>
		</div>
	);
}
