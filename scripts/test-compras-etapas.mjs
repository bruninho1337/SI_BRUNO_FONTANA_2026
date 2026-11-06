// Servidor local iniciado. Requer Playwright ou PLAYWRIGHT_MODULE_PATH.
// Executar: node scripts/test-compras-etapas.mjs. Não salva compras.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.TEST_BROWSER_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.setDefaultTimeout(20000);
page.on('dialog', (dialog) => dialog.accept());

async function stage(number) {
  await page.getByRole('status').filter({ hasText: `Etapa ${number} de 4:` }).waitFor();
}

async function advance() {
  await page.getByRole('button', { name: 'Validar e continuar', exact: true }).click();
}

async function selectFirst(trigger) {
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Selecionar', exact: true }).first().click();
  await dialog.waitFor({ state: 'detached' });
}

async function expectInvalid(id) {
  await page.locator(`#${id}-error`).waitFor();
  assert.equal(await page.locator(`#${id}`).getAttribute('aria-invalid'), 'true', id);
}

try {
  await page.goto(`${base}/cadastro/compras?mode=create`);
  await stage(1);
  await page.locator('form[data-unsaved-changes="false"]').filter({ has: page.locator('#modelo') }).waitFor();
  assert.equal(await page.locator('form [role="alert"]').count(), 0, 'Não deve mostrar erros antes da interação.');

  console.log('Verificando validação por campo e etapa inteira...');
  await page.locator('#modelo').focus();
  await page.locator('#serie').focus();
  await expectInvalid('modelo');
  assert.equal(await page.locator('#numero_nota-error').count(), 0, 'Campo não visitado deve ficar sem erro.');
  await page.locator('#modelo').fill('55');
  assert.equal(await page.locator('#modelo-error').count(), 0, 'Corrigir o campo deve limpar o erro.');
  await advance();
  await page.locator('#codfornecedor_display-error').waitFor();
  await expectInvalid('numero_nota');
  assert.equal(await page.locator('#codfornecedor_display-trigger').evaluate((element) => element === document.activeElement), true, 'Foco no primeiro erro.');
  assert.equal(await page.locator('#data_emissao').isDisabled(), true);

  await selectFirst(page.locator('#codfornecedor_display-trigger'));
  await page.locator('#serie').fill('999');
  await page.locator('#numero_nota').fill(String(Date.now()).slice(-9));
  await page.getByRole('status').filter({ hasText: 'Etapa 1 de 4:' }).click();
  await stage(1);
  assert.equal(await page.locator('#numero_nota').isDisabled(), false, 'Sair do último campo não deve avançar.');
  // Enter em um campo anterior também valida a etapa.
  await page.locator('#modelo').press('Enter');
  await stage(2);
  assert.equal(await page.locator('#modelo').isDisabled(), true, 'Chave anterior deve ficar bloqueada.');

  console.log('Verificando emissão e chegada sem avanço automático...');
  const today = await page.locator('#data_emissao').inputValue();
  await page.locator('#data_emissao').fill('2999-01-01');
  await page.locator('#data_chegada').focus();
  await expectInvalid('data_emissao');
  await page.locator('#data_emissao').fill(today);
  assert.equal(await page.locator('#data_emissao-error').count(), 0);
  await page.locator('#data_chegada').fill('2000-01-01');
  await page.locator('#data_emissao').focus();
  await expectInvalid('data_chegada');
  await advance();
  await stage(2);
  assert.equal(await page.locator('#data_chegada').evaluate((element) => element === document.activeElement), true);
  await page.locator('#data_chegada').fill(today);
  await page.getByRole('status').filter({ hasText: 'Etapa 2 de 4:' }).click();
  await stage(2);
  await advance();
  await stage(3);
  assert.equal(await page.locator('#data_emissao').isDisabled(), true);

  console.log('Verificando produto, quantidade, desconto e despesas...');
  await advance();
  await page.locator('#produto-item-0-error').waitFor();
  await selectFirst(page.locator('#produto-item-0-trigger'));
  await page.locator('#unitario-item-0').fill('10,00');
  await page.locator('#quantidade-item-0').fill('0');
  await page.locator('#unitario-item-0').focus();
  await expectInvalid('quantidade-item-0');
  await page.locator('#quantidade-item-0').fill('2');
  await page.locator('#desconto-item-0').fill('10,01');
  await page.locator('#unitario-item-0').focus();
  await expectInvalid('desconto-item-0');
  await page.locator('#unitario-item-0').fill('20,00');
  assert.equal(await page.locator('#desconto-item-0-error').count(), 0, 'Revalidar desconto quando o valor unitário mudar.');
  await page.locator('#valor_frete').fill('1,');
  await page.locator('#valor_seguro').focus();
  await expectInvalid('valor_frete');
  await page.locator('#outras_despesas').focus();
  await advance();
  await stage(3);
  await page.locator('#valor_frete').fill('0,00');
  await page.locator('#desconto-item-0').fill('0,00');
  await page.locator('#outras_despesas').focus();
  await page.getByRole('status').filter({ hasText: 'Etapa 3 de 4:' }).click();
  await stage(3);
  await advance();
  await stage(4);
  assert.equal(await page.locator('#quantidade-item-0').isDisabled(), true);

  console.log('Verificando vencimento e condição de pagamento...');
  if (!(await page.locator('[id$="-vencimento"]').count())) {
    await selectFirst(page.locator('#codcondicao_pagamento-trigger'));
  }
  const dueDate = page.locator('[id$="-vencimento"]').first();
  await dueDate.waitFor();
  const dueId = await dueDate.getAttribute('id');
  const validDueDate = await dueDate.inputValue();
  await dueDate.fill('2000-01-01');
  await page.locator('#observacoes').focus();
  await expectInvalid(dueId);
  // O envio inválido deve ficar no formulário, sem executar o salvamento.
  let invalidSaveRequests = 0;
  const onRequest = (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/cadastro/compras') invalidSaveRequests++; };
  page.on('request', onRequest);
  await page.getByRole('button', { name: 'Salvar compra', exact: true }).click();
  await stage(4);
  assert.equal(await dueDate.evaluate((element) => element === document.activeElement), true);
  assert.equal(invalidSaveRequests, 0, 'Vencimento inválido não pode chegar à ação de salvar.');
  page.off('request', onRequest);
  await dueDate.fill(validDueDate);
  assert.equal(await page.locator(`#${dueId}-error`).count(), 0);
  assert.deepEqual(errors, [], 'Não deve haver erros JavaScript.');
  console.log('OK: erros locais, correções, foco, botão, Enter, bloqueio das etapas e vencimentos; nenhuma compra salva.');
} finally {
  await context.close();
  await browser.close();
}
