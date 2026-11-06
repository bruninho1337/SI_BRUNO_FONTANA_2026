// Servidor local iniciado. Requer Playwright (ou PLAYWRIGHT_MODULE_PATH apontando para o pacote).
// Executar: node scripts/test-unsaved-changes.mjs. Não grava registros no banco.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.TEST_BROWSER_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
let accept = false;
const dialogs = [];
page.on('dialog', async (dialog) => { dialogs.push(dialog.type()); await (accept ? dialog.accept() : dialog.dismiss()); });
page.setDefaultTimeout(20000);
page.setDefaultNavigationTimeout(20000);
const dirty = (scope = page) => scope.locator('form[data-unsaved-changes="true"]');
async function waitDirty(expected, scope = page) {
	await (expected ? dirty(scope).first().waitFor() : page.waitForFunction(() => !document.querySelector('form[data-unsaved-changes="true"]')));
}
try {
	console.log('Verificando links e historico...');
	await page.goto(`${base}/cadastro/produtos-servicos/categorias`);
	await page.locator('a[href="/cadastro/produtos-servicos/categorias?mode=create"]').first().click();
	await page.locator('#categoria').fill('Alteracao temporaria');
	await waitDirty(true);
	const editUrl = page.url();
	await page.getByRole('link', { name: 'Voltar para dashboard' }).click();
	assert.equal(page.url(), editUrl);
	assert.equal(await page.locator('#categoria').inputValue(), 'ALTERACAO TEMPORARIA');
	assert.equal(dialogs.at(-1), 'confirm');
	assert.equal(await page.locator('[aria-label="Carregando"]').count(), 0, 'Cancelar saida nao deve abrir loading');
	// Voltar do navegador deve manter tanto o formulario quanto a URL ao recusar.
	const beforeBack = dialogs.length;
	await page.goBack({ timeout: 5000 }).catch(() => {});
	await page.waitForURL(editUrl);
	assert.equal(dialogs.length, beforeBack + 1);
	assert.equal(await page.locator('#categoria').inputValue(), 'ALTERACAO TEMPORARIA');
	// Recarregar a aba usa o aviso nativo do navegador.
	await page.reload({ timeout: 5000 }).catch(() => {});
	assert.equal(dialogs.at(-1), 'beforeunload');
	assert.equal(await page.locator('#categoria').inputValue(), 'ALTERACAO TEMPORARIA');
	// Voltar ao valor original elimina o aviso.
	await page.locator('#categoria').fill('');
	await waitDirty(false);
	const beforeClean = dialogs.length;
	await page.getByRole('link', { name: 'Voltar para dashboard' }).click();
	await page.waitForURL('**/dashboard/barbeiro');
	assert.equal(dialogs.length, beforeClean);
	// Campos controlados/ocultos (toggle) tambem contam como alteracao.
	console.log('Verificando campos ocultos e validacao...');
	await page.goto(`${base}/cadastro/produtos-servicos/categorias?mode=create`);
	await page.locator('form[data-unsaved-changes="false"]').waitFor();
	await page.getByRole('button', { name: 'Não', exact: true }).click();
	await waitDirty(true);
	await page.getByRole('button', { name: 'Sim', exact: true }).click();
	await waitDirty(false);
	// Um erro de validacao no servidor nao deve perder o formulario nem deixar a guarda suspensa.
	await page.locator('#categoria').fill('a');
	await page.locator('#categoria').evaluate((input) => { input.form.noValidate = true; });
	const beforeSubmit = dialogs.length;
	await page.getByRole('button', { name: 'Salvar categoria' }).click();
	await page.waitForFunction(() => document.querySelector('#categoria')?.value === 'A' && !!document.querySelector('form[data-unsaved-changes="true"]'));
	assert.equal(dialogs.length, beforeSubmit);
	accept = true;
	await page.getByRole('link', { name: 'Voltar para dashboard' }).click();
	await page.waitForURL('**/dashboard/barbeiro');
	accept = false;
	// Abrir um cadastro filho preserva o pai; fechar um filho alterado pede confirmacao.
	console.log('Verificando fechamento dos modais...');
	await page.goto(`${base}/cadastro/localidades/estados?mode=create`);
	await page.locator('#nome-estado').fill('Estado temporario');
	await page.locator('#codpais-trigger').click();
	await page.getByRole('button', { name: 'Novo pais' }).click();
	const frame = page.frameLocator('iframe[name="cadastro-embedded"]');
	await frame.locator('input[name="pais"]').fill('Pais temporario');
	await waitDirty(true, frame);
	const beforeClose = dialogs.length;
	await page.getByRole('button', { name: 'Fechar cadastro', exact: true }).click();
	assert.equal(dialogs.length, beforeClose + 1);
	assert.equal(await frame.locator('input[name="pais"]').inputValue(), 'PAIS TEMPORARIO');
	// Escape dentro do iframe passa pela mesma confirmacao.
	const escapeDialog = page.waitForEvent('dialog');
	await frame.locator('input[name="pais"]').press('Escape');
	await escapeDialog;
	assert.equal(dialogs.length, beforeClose + 2);
	accept = true;
	await page.getByRole('button', { name: 'Fechar cadastro', exact: true }).click();
	await page.locator('iframe[name="cadastro-embedded"]').waitFor({ state: 'detached' });
	assert.equal(await page.locator('#nome-estado').inputValue(), 'ESTADO TEMPORARIO');
	// Um formulario anterior oculto tambem deve ser protegido ao fechar a pilha inteira.
	await page.goto(`${base}/cadastro/localidades/cidades?mode=create`);
	accept = false;
	await page.locator('#codest-trigger').click();
	await page.getByRole('button', { name: 'Novo estado' }).click();
	const stateFrame = page.frameLocator('iframe[name="cadastro-embedded"]').first();
	await stateFrame.locator('#nome-estado').fill('Estado temporario no modal');
	await waitDirty(true, stateFrame);
	await stateFrame.locator('#codpais-trigger').click();
	await stateFrame.getByRole('button', { name: 'Novo pais' }).click();
	await page.locator('iframe[name="cadastro-embedded"]').nth(1).waitFor();
	const hiddenParentDialog = page.waitForEvent('dialog');
	await page.getByRole('button', { name: 'Fechar cadastro', exact: true }).click();
	await hiddenParentDialog;
	assert.equal(await page.locator('iframe[name="cadastro-embedded"]').count(), 2);
	assert.equal(await stateFrame.locator('#nome-estado').inputValue(), 'ESTADO TEMPORARIO NO MODAL');
	accept = true;
	await page.getByRole('button', { name: 'Fechar cadastro', exact: true }).click();
	await page.locator('iframe[name="cadastro-embedded"]').waitFor({ state: 'detached' });
	console.log('OK: links, historico, reload, alteracao desfeita, campos ocultos, erro de validacao e fechamento de modal com dados preservados.');
} finally {
	await context.close();
	await browser.close();
}
