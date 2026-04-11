import Link from "next/link";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ProdutosServicosTabs } from "@/components/produtos-servicos-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const camposServico = [
	{ id: "nome-servico", label: "Nome do Serviço", placeholder: "Ex: Corte social", type: "text" },
	{ id: "duracao-servico", label: "Duração", placeholder: "Ex: 45 min", type: "text" },
	{ id: "valor-servico", label: "Valor", placeholder: "Ex: 35,00", type: "text" },
	{ id: "descricao-servico", label: "Descrição", placeholder: "Descreva rapidamente o serviço", type: "textarea" },
];

export default function CadastroServicosPage() {
	return (
		<div className="min-h-screen bg-neutral-100 p-6 md:p-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
				<DashboardSidebar />
				<div className="flex-1 space-y-8">
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<h1 className="text-3xl font-bold text-neutral-900">Cadastro de Serviços</h1>
								<p className="mt-2 text-sm text-neutral-600">Tela exclusiva para o cadastro de serviços.</p>
							</div>
							<Button asChild className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
								<Link href="/dashboard/barbeiro">Voltar para dashboard</Link>
							</Button>
						</div>
						<div className="mt-6">
							<ProdutosServicosTabs currentPath="/cadastro/produtos-servicos/servicos" />
						</div>
					</div>
					<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-neutral-900">Dados do Serviço</h2>
							<p className="mt-1 text-sm text-neutral-500">Preencha os dados do serviço abaixo.</p>
						</div>
						<form className="space-y-4">
							{camposServico.map((campo) => (
								<div key={campo.id} className="flex flex-col gap-2">
									<Label htmlFor={campo.id} className="text-sm text-neutral-800">{campo.label}:</Label>
									{campo.type === "textarea" ? (
										<textarea id={campo.id} placeholder={campo.placeholder} rows={4} className="min-h-28 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring" />
									) : (
										<Input id={campo.id} type={campo.type} placeholder={campo.placeholder} className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900" />
									)}
								</div>
							))}
							<Button className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Salvar serviço</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
