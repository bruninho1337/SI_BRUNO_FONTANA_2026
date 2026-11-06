// Servidor de desenvolvimento iniciado. Requer Playwright ou PLAYWRIGHT_MODULE_PATH.
// Verifica os Insights do Next.js e os pop-ups de novo/editar, sem salvar registros.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.TEST_BROWSER_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const diagnostics = [];
page.setDefaultTimeout(20000);
page.on('pageerror', (error) => diagnostics.push(error.message));
page.on('console', (message) => {
  if (/Next\.js encountered (?:uncached|runtime) data during/.test(message.text())) diagnostics.push(message.text());
});
const routes = [
  'fornecedores', 'clientes', 'funcionarios', 'funcoes-funcionarios',
  'formas-pagamento', 'condicoes-pagamento', 'contas-pagar',
  'produtos-servicos/produtos', 'produtos-servicos/servicos',
  'produtos-servicos/categorias', 'produtos-servicos/marcas',
  'produtos-servicos/unidades-medida', 'localidades/cidades',
  'localidades/estados', 'localidades/paises',
];

async function noInsights() {
  for (const frame of page.frames()) {
    await frame.waitForLoadState('load');
    assert.equal(await frame.locator('[data-insights-only="true"], [data-error="true"][data-nextjs-toast]').count(), 0, frame.url());
  }
  assert.deepEqual(diagnostics, [], 'Os cadastros não devem gerar Insights de dados sem Suspense nem erros JavaScript.');
}

async function advance() {
  await page.getByRole('button', { name: 'Validar e continuar', exact: true }).click();
}

async function waitStage(number) {
  await page.getByRole('status').filter({ hasText: `Etapa ${number} de 4:` }).waitFor();
}

const activeFrame = () => page.frameLocator('iframe[name="cadastro-embedded"]').last();

try {
  for (const route of routes) {
    const response = await page.goto(`${base}/cadastro/${route}?mode=create&embedded=1`);
    assert.equal(response.status(), 200, route);
    await page.locator('main[data-cadastro-embedded] form[data-unsaved-changes]').waitFor();
    await noInsights();
  }
  console.log('OK: 15 cadastros em modo pop-up sem Insights.');

  // Reproduz o fluxo de Compras -> Produto -> Novo/Editar.
  await page.goto(`${base}/cadastro/compras?mode=create`);
  await page.locator('form[data-unsaved-changes="false"]').filter({ has: page.locator('#modelo') }).waitFor();
  await page.locator('#codfornecedor_display-trigger').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Selecionar', exact: true }).first().click();
  await page.locator('#modelo').fill('55');
  await page.locator('#serie').fill('999');
  await page.locator('#numero_nota').fill(String(Date.now()).slice(-9));
  await advance();
  await waitStage(2);
  await advance();
  await waitStage(3);
  await page.locator('#produto-item-0-trigger').click();
  await page.getByRole('button', { name: 'Novo produto', exact: true }).click();
  await activeFrame().getByRole('heading', { name: 'Novo Produto', exact: true }).waitFor();
  await activeFrame().locator('form[data-unsaved-changes]').waitFor();
  await noInsights();
  await page.getByRole('button', { name: 'Fechar cadastro', exact: true }).click();
  await page.locator('iframe[name="cadastro-embedded"]').waitFor({ state: 'detached' });

  await page.getByRole('button', { name: /^Editar / }).first().click();
  await activeFrame().getByRole('heading', { name: 'Editar Produto', exact: true }).waitFor();
  await activeFrame().locator('form[data-unsaved-changes]').waitFor();
  assert.ok(await activeFrame().locator('input[name="codproduto"]').inputValue());
  await noInsights();

  // Um cadastro aberto dentro do produto também deve carregar sem avisos.
  await activeFrame().locator('#codcategoria-trigger').click();
  await activeFrame().getByRole('button', { name: 'Nova categoria', exact: true }).click();
  await page.locator('iframe[name="cadastro-embedded"]').nth(1).waitFor();
  await activeFrame().locator('#categoria').waitFor();
  await activeFrame().locator('form[data-unsaved-changes]').waitFor();
  await noInsights();
  await page.getByRole('button', { name: 'Voltar ao cadastro anterior', exact: true }).click();
  await page.locator('iframe[name="cadastro-embedded"]').nth(1).waitFor({ state: 'detached' });
  await activeFrame().getByRole('heading', { name: 'Editar Produto', exact: true }).waitFor();
  await noInsights();
  console.log('OK: novo produto, editar produto e cadastro de categoria em pop-up aninhado; nenhum registro salvo.');
} finally {
  await context.close();
  await browser.close();
}
