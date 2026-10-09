// Com o servidor local iniciado: node scripts/test-cadastro-popups.mjs
// Verifica páginas e formulários sem criar ou alterar registros.
import assert from 'node:assert/strict';

const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const routes = [
	'fornecedores', 'clientes', 'funcionarios', 'funcoes-funcionarios',
	'formas-pagamento', 'condicoes-pagamento', 'contas-pagar',
	'produtos-servicos/produtos', 'produtos-servicos/servicos',
	'produtos-servicos/categorias', 'produtos-servicos/marcas',
	'produtos-servicos/unidades-medida', 'localidades/cidades',
	'localidades/estados', 'localidades/paises',
];

for (const route of routes) {
	const path = `/cadastro/${route}?mode=create&embedded=1`;
	const response = await fetch(new URL(path, baseUrl));
	const html = await response.text();
	assert.equal(response.status, 200, route);
	assert.match(html, /<main class="p-3 sm:p-5" data-cadastro-embedded="true">/, route);
	assert.match(html, /<form[\s>]/, route);
	assert.ok(!html.includes('Voltar para dashboard'), `${route}: exibiu a navegação externa`);
	const errorUrl = html.match(/name="_form_error_url"[^>]*value="([^"]+)"/)?.[1];
	assert.ok(errorUrl?.includes('embedded=1'), `${route}: erro de validação sairia do pop-up`);
}

const invalid = await fetch(new URL('/cadastro/fornecedores?mode=create&embedded=1&error=Teste', baseUrl));
const invalidHtml = await invalid.text();
assert.equal(invalid.status, 200);
assert.match(invalidHtml, /<form[\s>]/);
assert.ok(!invalidHtml.includes('Voltar para dashboard'));

const normal = await fetch(new URL('/cadastro/fornecedores?mode=create', baseUrl));
assert.equal(normal.status, 200);
assert.ok((await normal.text()).includes('Voltar para dashboard'));
console.log('OK: 15 cadastros isolados, retorno de validação no pop-up e página normal preservada.');
