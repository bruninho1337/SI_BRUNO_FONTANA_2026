// Executar: node scripts/test-compras-validacao.mjs (sem acesso ao banco).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadTs(path, dependencies = {}) {
	const exports = {};
	const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText;
	vm.runInNewContext(code, { exports, require: (name) => {
		assert.ok(name in dependencies, `Dependencia inesperada: ${name}`);
		return dependencies[name];
	}, FormData, URLSearchParams });
	return exports;
}

const validation = loadTs('lib/compras-validacao.ts');
const calc = loadTs('lib/compras-calculos.ts');
for (const value of ['0', '0,00', '1234,56', '1.234,56', '999.999.999.999,99', 12.34]) assert.equal(validation.validPurchaseMoney(value), true, String(value));
for (const value of ['', '-1', '+1', '1e2', '0x10', '1,234', '1.23', '1..000', '1,2,3', 'R$ 10,00', '10abc', ' 10', '1000000000000', null, {}, Infinity, -1]) assert.equal(validation.validPurchaseMoney(value), false, String(value));
for (const value of ['', '1', '1,', '1,2', '1,23', '1.', '1.2', '1.234,56']) assert.equal(validation.canTypePurchaseMoney(value), true, value);
for (const value of ['-10', 'a10', '1e2', '1,,2', '1,234', '1..000', '1 000']) assert.equal(validation.canTypePurchaseMoney(value), false, value);
for (const value of ['1', '2147483647', 1]) assert.equal(validation.validPurchaseInteger(value), true);
for (const value of ['0', '-1', '+1', '1.5', '1e2', '0x10', ' 1', '2147483648', true, [], {}]) assert.equal(validation.validPurchaseInteger(value), false);
assert.equal(validation.validPurchaseDigits('001', 3), true);
for (const value of ['A1', '-1', '1!', '1.0', '1234', '']) assert.equal(validation.validPurchaseDigits(value, 3), false);
for (const value of ['0', '100.00333333333333333333333333333333']) assert.equal(validation.validPurchasePreciseCost(value), true);
for (const value of ['-1', '1e2', 'NaN', '1000000000000', '1.' + '1'.repeat(33), {}, null]) assert.equal(validation.validPurchasePreciseCost(value), false);

const reachedDatabase = new Error('Entrada valida chegou ao banco simulado');
let queries = 0;
const actions = loadTs('app/cadastro/compras/actions.ts', {
	'@/lib/compras-calculos': calc,
	'@/lib/compras-validacao': validation,
	'@/lib/database/db': { db: {
		connect: async () => { throw reachedDatabase; },
		query: async () => { queries++; return { rowCount: 0 }; },
	} },
	'next/cache': { revalidatePath() {} },
	'next/navigation': { redirect(url) { const error = new Error('redirect'); error.url = url; throw error; } },
});
const item = { codproduto: '1', quantidade: '2', valor_unitario: '100,00', valor_desconto: '0,00' };
const data = {
			desconto_tipo: 'UNITARIO',
	codfornecedor: '1', codcondicao_pagamento: '1', modelo: '55', serie: '001', numero_nota: '000012345',
	data_emissao: calc.purchaseToday(), data_chegada: calc.purchaseToday(),
	valor_frete: '0,00', valor_seguro: '0,00', outras_despesas: '0,00',
	observacoes: 'Recepção: João & Cia. (entrega #1)!', itens_json: JSON.stringify([item]),
};
async function invoke(overrides = {}) {
	const form = new FormData();
	for (const [name, value] of Object.entries({ ...data, ...overrides })) form.set(name, value);
	try { await actions.createCompraAction(form); assert.fail('Esperava validacao ou banco simulado'); }
	catch (error) {
		if (error === reachedDatabase) return 'valid';
		if (!error.url) throw error;
		assert.ok(new URL(error.url, 'http://localhost').searchParams.has('error'));
		return 'invalid';
	}
}
assert.equal(await invoke(), 'valid');
assert.equal(await invoke({ desconto_tipo: '' }), 'invalid', 'Formulario antigo deve pedir revisao do desconto');
assert.equal(await invoke({ itens_json: JSON.stringify([{ ...item, valor_desconto: '100,01' }]) }), 'invalid', 'Desconto unitario acima do custo deve ser rejeitado mesmo abaixo do total bruto');
assert.equal(await invoke({ itens_json: JSON.stringify([{ ...item, valor_desconto: '2,00' }]) }), 'valid');
for (const field of ['modelo', 'serie', 'numero_nota']) {
	for (const value of ['-1', 'A', '1!', '1e2']) assert.equal(await invoke({ [field]: value }), 'invalid', `${field}: ${value}`);
}
for (const field of ['codfornecedor', 'codcondicao_pagamento']) {
	for (const value of ['0', '-1', '1e2', '0x10', '2147483648']) assert.equal(await invoke({ [field]: value }), 'invalid');
}
for (const field of ['valor_frete', 'valor_seguro', 'outras_despesas']) {
	for (const value of ['-1,00', '1e2', '1,234', '1000000000000']) assert.equal(await invoke({ [field]: value }), 'invalid');
}
for (const field of ['codproduto', 'quantidade', 'valor_unitario', 'valor_desconto', 'valor_unitario_preciso']) {
	for (const value of ['-1', '1e2', '0x10', 'abc', {}, null]) {
		assert.equal(await invoke({ itens_json: JSON.stringify([{ ...item, [field]: value }]) }), 'invalid', `${field}: ${value}`);
	}
}
for (const badItem of [{ quantidade: '0' }, { quantidade: '1.5' }, { quantidade: '2147483648' }, { valor_desconto: '200,01' }, { valor_unitario_preciso: '99.99' }]) {
	assert.equal(await invoke({ itens_json: JSON.stringify([{ ...item, ...badItem }]) }), 'invalid');
}
for (const itens_json of ['[]', '[null]', '[1]', '{', '{}']) assert.equal(await invoke({ itens_json }), 'invalid');
assert.equal(await invoke({ observacoes: 'a'.repeat(256) }), 'invalid');
assert.equal(await invoke({ data_emissao: '2026-02-30' }), 'invalid');
assert.equal(await invoke({ data_chegada: '2999-01-01' }), 'invalid');
const key = { codfornecedor: '1', modelo: '55', serie: '001', numeroNota: '000012345' };
assert.equal((await actions.validateCompraKeyAction(key)).valid, true);
assert.equal(queries, 1);
for (const overrides of [{ modelo: '-1' }, { serie: 'A!' }, { numeroNota: '1e2' }, { codfornecedor: '0x10' }]) assert.equal((await actions.validateCompraKeyAction({ ...key, ...overrides })).valid, false);
assert.equal(queries, 1, 'Chaves invalidas devem ser rejeitadas antes da consulta');
console.log('OK: validacao de digitacao e servidor; negativos, simbolos, limites, formatos, datas e texto livre.');
