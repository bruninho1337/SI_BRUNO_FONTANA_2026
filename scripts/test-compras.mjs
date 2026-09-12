// Executar: node scripts/test-compras.mjs
// Usa o banco local configurado e desfaz todos os registros com rollback.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import pg from 'pg';
import nextEnv from '@next/env';
const { Pool } = pg;
const resolveDependency = createRequire(import.meta.url);
nextEnv.loadEnvConfig(process.cwd());

function loadTs(path, dependencies = {}) {
	const exports = {};
	const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText;
	vm.runInNewContext(code, { exports, require: (name) => dependencies[name] ?? resolveDependency(name), FormData, URLSearchParams, console });
	return exports;
}

async function main() {
	const calc = loadTs('lib/compras-calculos.ts');
	assert.equal(JSON.stringify(calc.allocateMoney(10, [1, 1, 1])), '[3.34,3.33,3.33]');
	assert.equal(JSON.stringify(calc.allocateMoney(30, [100, 200])), '[10,20]');
	assert.equal(JSON.stringify(calc.allocateMoney(-0.05, [1, 1, 1])), '[-0.02,-0.02,-0.01]');
	assert.equal(JSON.stringify(calc.allocateMoney(12, [0, 100])), '[0,12]');
	assert.equal(calc.addDays('2024-02-28', 2), '2024-03-01');
	assert.equal(calc.addDays('2026-12-31', 30), '2027-01-30');
	assert.equal(calc.isIsoDate('2026-02-30'), false);
	assert.equal(calc.isIsoDate('2024-02-29'), true);
	for (let cents = 1; cents < 1000; cents++) {
		const values = calc.allocateMoney(cents / 100, [13.3333, 26.6667, 60]);
		assert.equal(Math.round(values.reduce((a, b) => a + b, 0) * 100), cents);
	}
	console.log('OK: rateio, centavos, descontos e datas.');
	const url = new URL(process.env.DATABASE_URL);
	assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname), 'Teste permitido somente em banco local.');
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const client = await pool.connect();
	try {
		await client.query('begin');
		const wrapped = {
			query: (sql, args) => client.query(sql === 'begin' ? 'savepoint compra_test' : sql === 'commit' ? 'release savepoint compra_test' : sql === 'rollback' ? 'rollback to savepoint compra_test' : sql, args),
			release() {},
		};
		const actions = loadTs('app/cadastro/compras/actions.ts', {
			'@/lib/compras-calculos': calc,
			'@/lib/database/db': { db: { connect: async () => wrapped, query: (...args) => client.query(...args) } },
			'next/cache': { revalidatePath() {} },
			'next/navigation': { redirect(url) { const error = new Error('redirect'); error.url = url; throw error; } },
		});
		const supplier = (await client.query("select codfornecedor from public.fornecedores where ativo = 'S' limit 1")).rows[0];
		const product = (await client.query("select codproduto, quantidade_estoque from public.produtos where ativo = 'S' limit 1")).rows[0];
		const condition = (await client.query(`select cp.codcondicao_pagamento, cp.parcelas from public.condicoes_pagamento cp
			join public.condicoes_pagamento_parcelas p using (codcondicao_pagamento) where cp.ativo = 'S'
			group by cp.codcondicao_pagamento having count(*) = cp.parcelas and abs(sum(p.percentual) - 100) < 0.0001
			order by cp.parcelas desc limit 1`)).rows[0];
		assert.ok(supplier && product && condition, 'Cadastre fornecedor, produto e condição com parcelas antes do teste.');
		const terms = (await client.query('select * from public.condicoes_pagamento_parcelas where codcondicao_pagamento = $1 order by num_parcela', [condition.codcondicao_pagamento])).rows;
		const note = `TEST-${Date.now()}`;
		const key = ['55', 'TEST', note, supplier.codfornecedor];
		const data = {
			modelo: key[0], serie: key[1], numero_nota: note, codfornecedor: String(supplier.codfornecedor),
			codcondicao_pagamento: String(condition.codcondicao_pagamento), data_emissao: '2026-01-01', data_chegada: '2026-01-02',
			valor_frete: '20,00', valor_seguro: '5,00', outras_despesas: '5,00', valor_desconto: '10,00',
			itens_json: JSON.stringify([{ codproduto: product.codproduto, quantidade: '2', valor_unitario: '100,00', valor_desconto: '20,00' }]),
			vencimentos_json: JSON.stringify(terms.map((term, index) => index === 0 ? '2026-02-15' : null)),
		};
		async function invoke(action, overrides = {}) {
			const form = new FormData();
			for (const [name, value] of Object.entries({ ...data, ...overrides })) form.set(name, value);
			try { await action(form); assert.fail('Expected redirect'); }
			catch (error) { if (!error.url) throw error; return new URL(error.url, 'http://localhost').searchParams; }
		}
		assert.ok((await invoke(actions.createCompraAction, { data_emissao: '2999-01-01' })).has('error'));
		assert.ok((await invoke(actions.createCompraAction, { data_chegada: '2025-12-31' })).has('error'));
		assert.ok((await invoke(actions.createCompraAction, { data_emissao: '2026-02-30' })).has('error'));
		assert.ok((await invoke(actions.createCompraAction, { vencimentos_json: '["2025-01-01"]' })).has('error'));
		const result = await invoke(actions.createCompraAction);
		assert.ok(result.has('success'), result.get('error'));
		const duplicate = await actions.validateCompraKeyAction({ modelo: ' 55 ', serie: 'test', numeroNota: note.toLowerCase(), codfornecedor: data.codfornecedor });
		assert.equal(duplicate.valid, false);
		assert.ok((await invoke(actions.createCompraAction)).has('error'));
		const purchaseWhere = 'modelo=$1 and serie=$2 and numero_nota=$3 and codfornecedor=$4';
		const purchase = (await client.query(`select * from public.compras where ${purchaseWhere}`, key)).rows[0];
		assert.equal(Number(purchase.valor_total), 200);
		const item = (await client.query(`select * from public.compras_itens where ${purchaseWhere}`, key)).rows[0];
		assert.equal(Number(item.valor_rateio), 20);
		const updatedProduct = (await client.query('select * from public.produtos where codproduto=$1', [product.codproduto])).rows[0];
		assert.equal(Number(updatedProduct.quantidade_estoque), Number(product.quantidade_estoque) + 2);
		assert.equal(Number(updatedProduct.preco_custo), 100);
		const accounts = (await client.query(`select cp.*, p.num_parcela from public.compras_parcelas p join public.contas_pagar cp using(codconta_pagar)
			where p.modelo=$1 and p.serie=$2 and p.numero_nota=$3 and p.codfornecedor=$4 order by p.num_parcela`, key)).rows;
		assert.equal(accounts.length, terms.length);
		assert.equal(Math.round(accounts.reduce((sum, account) => sum + Number(account.valor), 0) * 100), 20000);
		assert.equal(accounts[0].data_vencimento.toISOString().slice(0, 10), '2026-02-15');
		for (let i = 1; i < terms.length; i++) assert.equal(accounts[i].data_vencimento.toISOString().slice(0, 10), calc.addDays(data.data_emissao, terms[i].dias_vencimento));
		assert.ok((await invoke(actions.cancelCompraAction, { motivo_cancelamento: '   ' })).has('error'));
		await client.query("update public.contas_pagar set valor_pago=1, status='PAGO' where codconta_pagar=$1", [accounts[0].codconta_pagar]);
		assert.ok((await invoke(actions.cancelCompraAction, { motivo_cancelamento: 'Teste' })).has('error'));
		await client.query("update public.contas_pagar set valor_pago=0, status='PENDENTE' where codconta_pagar=$1", [accounts[0].codconta_pagar]);
		assert.ok((await invoke(actions.cancelCompraAction, { motivo_cancelamento: 'Teste de cancelamento' })).has('success'));
		const cancelled = (await client.query(`select * from public.compras where ${purchaseWhere}`, key)).rows[0];
		assert.equal(cancelled.status, 'CANCELADA');
		assert.equal(cancelled.motivo_cancelamento, 'Teste de cancelamento');
		const stock = (await client.query('select quantidade_estoque from public.produtos where codproduto=$1', [product.codproduto])).rows[0];
		assert.equal(Number(stock.quantidade_estoque), Number(product.quantidade_estoque));
		const statuses = (await client.query('select status from public.contas_pagar where codconta_pagar=any($1::bigint[])', [accounts.map((account) => account.codconta_pagar)])).rows;
		assert.ok(statuses.every((account) => account.status === 'CANCELADO'));
		assert.ok((await invoke(actions.cancelCompraAction, { motivo_cancelamento: 'Repetido' })).has('error'));
		console.log('OK: criação, duplicidade, datas, parcelas, vencimento ajustado, custo, motivo, pagamento e cancelamento.');
	} finally {
		await client.query('rollback');
		client.release();
		await pool.end();
		console.log('Rollback concluído: nenhum registro de teste mantido.');
	}
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
