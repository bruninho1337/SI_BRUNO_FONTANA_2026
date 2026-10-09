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
	assert.equal(JSON.stringify(calc.allocateInstallments(10.01, [30, 30, 40])), '[3,3,4.01]');
	assert.equal(JSON.stringify(calc.allocateInstallments(10, [33.33, 33.33, 33.34])), '[3.33,3.33,3.34]');
	assert.equal(JSON.stringify(calc.allocateInstallments(10, [25, 25, 50])), '[2.5,2.5,5]');
	assert.equal(JSON.stringify(calc.allocateInstallments(12, [100 / 3, 100 / 3, 100 / 3])), '[4,4,4]');
	assert.equal(calc.allocateInstallments(10, [100 / 3, 100 / 3, 100 / 3]), null);
	assert.equal(calc.allocateInstallments(10.01, [25, 25, 25, 25]), null);
	// O peso independe da quantidade e do desconto total do item.
	assert.equal(JSON.stringify(calc.allocatePurchaseCosts(30, [100, 200])), '[10,20]');
	assert.equal(JSON.stringify(calc.allocatePurchaseCosts(-30, [100, 200])), '[-10,-20]');
	assert.equal(JSON.stringify(calc.allocatePurchaseCosts(10, [0, 100])), '[0,10]');
	assert.equal(calc.roundMoney((1000 + calc.allocatePurchaseCosts(30, [100, 200])[0]) / 10), 101);
	assert.equal(calc.roundMoney(200 + calc.allocatePurchaseCosts(30, [100, 200])[1]), 220);
	assert.equal(calc.addDays('2024-02-28', 2), '2024-03-01');
	assert.equal(calc.addDays('2026-12-31', 30), '2027-01-30');
	assert.equal(calc.isIsoDate('2026-02-30'), false);
	assert.equal(calc.isIsoDate('2024-02-29'), true);
	for (let cents = 1; cents < 1000; cents++) {
		const values = calc.allocateMoney(cents / 100, [13.3333, 26.6667, 60]);
		assert.equal(Math.round(values.reduce((a, b) => a + b, 0) * 100), cents);
		for (const percentages of [[30, 30, 40], [20, 20, 20, 20, 20], [20, 20, 20, 20, 10, 10]]) {
			const installments = calc.allocateInstallments(cents / 100, percentages);
			if (installments === null) {
				assert.ok(percentages.length === 5 || percentages.length === 6);
				assert.notEqual(cents % (percentages.length === 5 ? 5 : 2), 0);
				continue;
			}
			assert.equal(Math.round(installments.reduce((a, b) => a + b, 0) * 100), cents);
			for (let i = 0; i < percentages.length; i++) {
				for (let j = 0; j < i; j++) {
					if (percentages[i] === percentages[j]) assert.equal(installments[i], installments[j]);
				}
			}
		}
	}
	console.log('OK: rateio, centavos, descontos e datas.');
	if (process.argv.includes('--calculos')) return;
	const url = new URL(process.env.DATABASE_URL);
	assert.ok(['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname), 'Teste permitido somente em banco local.');
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const client = await pool.connect();
	try {
		await client.query('begin');
		const discountColumn = await client.query("select 1 from information_schema.columns where table_schema='public' and table_name='compras' and column_name='valor_desconto'");
		assert.equal(discountColumn.rowCount, 0, 'Aplique compras_remover_desconto_geral.sql antes do teste.');
		const itemDiscountColumn = await client.query("select 1 from information_schema.columns where table_schema='public' and table_name='compras_itens' and column_name='valor_desconto'");
		assert.equal(itemDiscountColumn.rowCount, 1);
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
		const note = String(100000000 + Date.now() % 900000000);
		const key = ['55', 'TST', note, supplier.codfornecedor];
		const data = {
			modelo: key[0], serie: key[1], numero_nota: note, codfornecedor: String(supplier.codfornecedor),
			codcondicao_pagamento: String(condition.codcondicao_pagamento), data_emissao: '2026-01-01', data_chegada: '2026-01-02',
			valor_frete: '20,00', valor_seguro: '5,00', outras_despesas: '5,00',
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
		assert.equal((await invoke(actions.createCompraAction, { data_chegada: calc.addDays(calc.purchaseToday(), 1) })).get('error'), 'A data de chegada deve ser valida, igual ou posterior a emissao e igual ou anterior a hoje.');
		assert.ok((await invoke(actions.createCompraAction, { data_emissao: '2026-02-30' })).has('error'));
		assert.ok((await invoke(actions.createCompraAction, { vencimentos_json: '["2025-01-01"]' })).has('error'));
		for (const overrides of [{ modelo: '555' }, { serie: '1234' }]) {
			assert.ok((await invoke(actions.createCompraAction, overrides)).has('error'));
			const validation = await actions.validateCompraKeyAction({ modelo: key[0], serie: key[1], numeroNota: note, codfornecedor: data.codfornecedor, ...overrides });
			assert.equal(validation.valid, false);
		}
		assert.ok((await invoke(actions.createCompraAction, { numero_nota: '1234567890' })).has('error'));
		assert.equal((await actions.validateCompraKeyAction({ modelo: key[0], serie: key[1], numeroNota: '1234567890', codfornecedor: data.codfornecedor })).valid, false);
		// Rascunhos antigos não podem aplicar o campo removido pelo servidor.
		const result = await invoke(actions.createCompraAction, { valor_desconto: '999,00' });
		assert.ok(result.has('success'), result.get('error'));
		const duplicate = await actions.validateCompraKeyAction({ modelo: ' 55 ', serie: 'tst', numeroNota: note.toLowerCase(), codfornecedor: data.codfornecedor });
		assert.equal(duplicate.valid, false);
		assert.ok((await invoke(actions.createCompraAction)).has('error'));
		const purchaseWhere = 'modelo=$1 and serie=$2 and numero_nota=$3 and codfornecedor=$4';
		for (const table of ['compras', 'compras_itens', 'compras_parcelas']) {
			for (const [column, value] of [['modelo', '555'], ['serie', '1234'], ['numero_nota', '1234567890']]) {
				await client.query('savepoint limite_test');
				await assert.rejects(client.query(`update public.${table} set ${column}=$5 where ${purchaseWhere}`, [...key, value]), { code: '22001' });
				await client.query('rollback to savepoint limite_test');
				await client.query('release savepoint limite_test');
			}
		}
		console.log('OK: limites de modelo, serie e numero da nota no servidor e nas tres tabelas.');
		const purchase = (await client.query(`select * from public.compras where ${purchaseWhere}`, key)).rows[0];
		assert.equal(Number(purchase.valor_total), 210);
		const item = (await client.query(`select * from public.compras_itens where ${purchaseWhere}`, key)).rows[0];
		assert.equal(Number(item.valor_rateio), 30);
		const updatedProduct = (await client.query('select * from public.produtos where codproduto=$1', [product.codproduto])).rows[0];
		assert.equal(Number(updatedProduct.quantidade_estoque), Number(product.quantidade_estoque) + 2);
		assert.equal(Number(updatedProduct.preco_custo), 105);
		const accounts = (await client.query(`select cp.*, p.num_parcela from public.compras_parcelas p join public.contas_pagar cp using(codconta_pagar)
			where p.modelo=$1 and p.serie=$2 and p.numero_nota=$3 and p.codfornecedor=$4 order by p.num_parcela`, key)).rows;
		assert.equal(accounts.length, terms.length);
		assert.equal(Math.round(accounts.reduce((sum, account) => sum + Number(account.valor), 0) * 100), 21000);
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

		const secondProduct = (await client.query("select codproduto from public.produtos where ativo = 'S' and codproduto <> $1 limit 1", [product.codproduto])).rows[0];
		assert.ok(secondProduct, 'Cadastre dois produtos ativos para testar rateio por custo unitario.');
		await client.query('update public.condicoes_pagamento set parcelas=3 where codcondicao_pagamento=$1', [condition.codcondicao_pagamento]);
		await client.query('delete from public.condicoes_pagamento_parcelas where codcondicao_pagamento=$1', [condition.codcondicao_pagamento]);
		for (const [index, percentage] of [30, 30, 40].entries()) {
			await client.query(`insert into public.condicoes_pagamento_parcelas
				(codcondicao_pagamento, num_parcela, dias_vencimento, percentual, codforma_pagamento) values ($1,$2,$3,$4,$5)`,
				[condition.codcondicao_pagamento, index + 1, 30 * (index + 1), percentage, terms[0].codforma_pagamento]);
		}
		const mixedNote = String(Number(note) + 1);
		const mixedKey = [key[0], key[1], mixedNote, key[3]];
		const mixedData = {
			numero_nota: mixedNote, valor_frete: '30,01', valor_seguro: '0,00', outras_despesas: '0,00',
			itens_json: JSON.stringify([
				{ codproduto: product.codproduto, quantidade: '10', valor_unitario: '100,00', valor_desconto: '10,00' },
				{ codproduto: secondProduct.codproduto, quantidade: '1', valor_unitario: '200,00', valor_desconto: '0,00' },
			]), vencimentos_json: '[null,null,null]',
		};
		const mixedResult = await invoke(actions.createCompraAction, mixedData);
		assert.ok(mixedResult.has('success'), mixedResult.get('error'));
		const mixedItems = (await client.query(`select valor_rateio from public.compras_itens where ${purchaseWhere} order by num_item`, mixedKey)).rows;
		assert.deepEqual(mixedItems.map((item) => Number(item.valor_rateio)), [10, 20.01]);
		const mixedCosts = (await client.query('select codproduto, preco_custo from public.produtos where codproduto=any($1::int[])', [[product.codproduto, secondProduct.codproduto]])).rows;
		assert.equal(Number(mixedCosts.find((item) => item.codproduto === product.codproduto).preco_custo), 100);
		assert.equal(Number(mixedCosts.find((item) => item.codproduto === secondProduct.codproduto).preco_custo), 220.01);
		const mixedAccounts = (await client.query(`select cp.valor from public.compras_parcelas p join public.contas_pagar cp using(codconta_pagar)
			where p.modelo=$1 and p.serie=$2 and p.numero_nota=$3 and p.codfornecedor=$4 order by p.num_parcela`, mixedKey)).rows;
		assert.deepEqual(mixedAccounts.map((account) => Number(account.valor)), [366, 366, 488.01]);
		await client.query('update public.condicoes_pagamento set parcelas=2 where codcondicao_pagamento=$1', [condition.codcondicao_pagamento]);
		await client.query('delete from public.condicoes_pagamento_parcelas where codcondicao_pagamento=$1 and num_parcela=3', [condition.codcondicao_pagamento]);
		await client.query('update public.condicoes_pagamento_parcelas set percentual=50 where codcondicao_pagamento=$1', [condition.codcondicao_pagamento]);
		const impossibleResult = await invoke(actions.createCompraAction, { ...mixedData, numero_nota: String(Number(note) + 2), vencimentos_json: '[null,null]' });
		assert.match(impossibleResult.get('error'), /mantendo valores iguais/);
		assert.equal((await client.query(`select 1 from public.compras where ${purchaseWhere}`, [key[0], key[1], String(Number(note) + 2), key[3]])).rowCount, 0);
		console.log('OK: rateio por custo unitario com quantidades diferentes, percentuais iguais e bloqueio de divisao impossivel.');
	} finally {
		await client.query('rollback');
		client.release();
		await pool.end();
		console.log('Rollback concluído: nenhum registro de teste mantido.');
	}
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
