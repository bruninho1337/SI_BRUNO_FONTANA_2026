import { queryMaybeSingle, queryRows } from "@/lib/database/db";

type Resumo = {
	clientes: number;
	servicos: number;
	produtos: number;
	sem_estoque: number;
	saldo_pendente: string;
	contas_vencidas: number;
};

type Conta = {
	codconta_pagar: string;
	conta_pagar: string;
	fornecedor: string;
	vencimento: string;
	saldo: string;
	situacao: "Vencida" | "Vence hoje" | "A vencer";
};

type Compra = {
	modelo: string;
	serie: string;
	numero_nota: string;
	codfornecedor: string;
	fornecedor: string;
	emissao: string;
	valor_total: string;
};

export async function carregarDashboard() {
	// Keep due dates independent of the database server timezone.
	const hoje = "(current_timestamp at time zone 'America/Sao_Paulo')::date";
	const [resumo, contas, compras] = await Promise.all([
		queryMaybeSingle<Resumo>(`
			select
				(select count(*)::int from public.clientes where ativo = 'S') as clientes,
				(select count(*)::int from public.servicos where ativo = 'S') as servicos,
				(select count(*)::int from public.produtos where ativo = 'S') as produtos,
				(select count(*)::int from public.produtos where ativo = 'S' and quantidade_estoque = 0) as sem_estoque,
				coalesce(sum(greatest(valor - valor_pago, 0)), 0)::text as saldo_pendente,
				count(*) filter (where data_vencimento < ${hoje} and valor > valor_pago)::int as contas_vencidas
			from public.contas_pagar
			where ativo = 'S' and status = 'PENDENTE'
		`),
		queryRows<Conta>(`
			select cp.codconta_pagar::text, cp.conta_pagar, f.fornecedor,
				to_char(cp.data_vencimento, 'DD/MM/YYYY') as vencimento,
				(cp.valor - cp.valor_pago)::text as saldo,
				case when cp.data_vencimento < ${hoje} then 'Vencida'
					when cp.data_vencimento = ${hoje} then 'Vence hoje'
					else 'A vencer' end as situacao
			from public.contas_pagar cp
			join public.fornecedores f on f.codfornecedor = cp.codfornecedor
			where cp.ativo = 'S' and cp.status = 'PENDENTE' and cp.valor > cp.valor_pago
			order by cp.data_vencimento asc, cp.codconta_pagar asc
			limit 5
		`),
		queryRows<Compra>(`
			select c.modelo, c.serie, c.numero_nota, c.codfornecedor::text, f.fornecedor,
				to_char(c.data_emissao, 'DD/MM/YYYY') as emissao, c.valor_total::text
			from public.compras c
			join public.fornecedores f on f.codfornecedor = c.codfornecedor
			where c.ativo = 'S' and c.status = 'CONFIRMADA'
			order by c.data_emissao desc, c.data_cadastro desc,
				c.modelo, c.serie, c.numero_nota, c.codfornecedor
			limit 5
		`),
	]);

	return { resumo, contas, compras };
}
