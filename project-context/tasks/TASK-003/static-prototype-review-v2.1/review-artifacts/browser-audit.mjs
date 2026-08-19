import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:\\Users\\admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..', '..', '..', '..');
const root = path.join(projectRoot, 'prototypes', 'task-003-eval-console-v2.1');
const out = path.join(scriptDir, 'v2.1');
fs.mkdirSync(out, { recursive: true });
const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const url = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

const consoleErrors = [];
const consoleMessages = [];
page.on('console', (msg) => {
  consoleMessages.push({ type: msg.type(), text: msg.text() });
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('requestfailed', (req) => consoleErrors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText ?? ''}`));

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  else console.log(`  ✓ ${name}`);
};

// 滚过整页触发 reveal，再返回顶部
async function scrollThrough() {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

async function visibleCaseIds() {
  return page.locator('.case-row:visible').evaluateAll((rows) => rows.map((r) => r.dataset.caseId));
}

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1000);
await scrollThrough();
await page.screenshot({ path: path.join(out, '01-desktop-overview.png') });

console.log('\n[1] 首屏结构与数量');
check('8 个 Case 行', (await page.locator('.case-row').count()) === 8, `实际 ${await page.locator('.case-row').count()}`);
check('无 heroParallax', (await page.locator('#heroParallax').count()) === 0);
check('无 Journey Map', (await page.locator('.mini-journey, #journeyVisual, .journey-node').count()) === 0);
const summaryH = await page.locator('#summary').evaluate((el) => el.getBoundingClientRect().height);
check('摘要横条 ≤ 160px', summaryH <= 160, `实际 ${Math.round(summaryH)}px`);

// S2：首屏所有卡片可见高度 ≤ 35% 视口（B1 阻断项回归审计）
async function firstScreenCards() {
  return page.evaluate(() => {
    const vh = innerHeight;
    return [...document.querySelectorAll('.card')]
      .filter((c) => { const r = c.getBoundingClientRect(); return r.top < vh && r.bottom > 0 && r.height > 0; })
      .map((c) => {
        const r = c.getBoundingClientRect();
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        return {
          title: c.querySelector('h2, h3')?.textContent?.trim()?.slice(0, 22) || c.getAttribute('aria-label') || '',
          visibleHeight: Math.round(visible),
          ratio: +(visible / vh).toFixed(2),
        };
      });
  });
}
const desktopCards = await firstScreenCards();
const dCardFail = desktopCards.filter((c) => c.ratio > 0.35);
check('桌面首屏卡片可见高度均 ≤35% 视口', dCardFail.length === 0, JSON.stringify(dCardFail));
const issueVisible = await page.locator('#issueList li:visible').count();
check('评测发现默认显示 2 条', issueVisible === 2, `实际 ${issueVisible}`);
check('第 3/4 条默认隐藏', (await page.locator('#issueList li:visible').count()) === 2 && await page.locator('#issueList [data-issue="N3"]').isHidden());
await page.locator('#toggleIssues').click();
check('展开后显示 4 条', (await page.locator('#issueList li:visible').count()) === 4);
await page.locator('#toggleIssues').click();

console.log('\n[2] Case 筛选 Tabs');
await page.locator('#tab-good').click();
check('Good 筛选 = E001/E004/E007', JSON.stringify((await visibleCaseIds()).sort()) === JSON.stringify(['E001', 'E004', 'E007']), JSON.stringify(await visibleCaseIds()));
await page.locator('#tab-same').click();
check('Same 筛选 = E005/E006', JSON.stringify((await visibleCaseIds()).sort()) === JSON.stringify(['E005', 'E006']), JSON.stringify(await visibleCaseIds()));
await page.locator('#tab-bad').click();
check('Bad 筛选 = E002/E003', JSON.stringify((await visibleCaseIds()).sort()) === JSON.stringify(['E002', 'E003']), JSON.stringify(await visibleCaseIds()));
await page.locator('#tab-all').click();
check('全部 = 8 条', (await page.locator('.case-row:visible').count()) === 8);

console.log('\n[3] Case 展开');
const e001 = page.locator('.case-row[data-case-id="E001"]');
await e001.locator('.case-trigger').click();
const expState = await e001.evaluate((row) => ({
  open: row.dataset.open,
  ariaExpanded: row.querySelector('.case-trigger').getAttribute('aria-expanded'),
  cols: getComputedStyle(row.querySelector('.compare-panel')).gridTemplateColumns.split(' ').length,
}));
check('E001 展开 + aria-expanded', expState.open === 'true' && expState.ariaExpanded === 'true');
check('Before/After 双栏', expState.cols === 2, `列数 ${expState.cols}`);
await page.locator('.case-row[data-case-id="E001"]').screenshot({ path: path.join(out, '02-case-expanded.png') });

console.log('\n[4] Case 详情 Drawer');
await e001.locator('[data-open-case="E001"]').click();
await page.waitForTimeout(350);
check('Drawer 可见 + aria-modal', await page.locator('#drawer').isVisible() && (await page.locator('#drawer').getAttribute('aria-modal')) === 'true');
check('Drawer 标题为 Case 输入', (await page.locator('#drawerTitle').textContent()).includes('橘猫'));
const naInDrawer = await page.locator('#drawerBody').getByText('未采集').count();
check('Trace 含 ≥4 处「未采集」', naInDrawer >= 4, `实际 ${naInDrawer}`);
const traceRowCount = await page.locator('.trace-table tbody tr').count();
check('Trace 表 ≥7 行', traceRowCount >= 7, `实际 ${traceRowCount}`);
check('Trace 表含「召回原因」', (await page.locator('.trace-table').textContent()).includes('召回原因'));
check('Drawer 打开后焦点在关闭按钮', (await page.evaluate(() => document.activeElement?.id)) === 'drawerClose');
await page.screenshot({ path: path.join(out, '03-case-drawer.png') });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
check('Escape 关闭 Drawer', await page.locator('#drawer').isHidden());
check('Escape 后焦点还原', (await page.evaluate(() => document.activeElement?.dataset?.openCase)) === 'E001', `焦点 ${await page.evaluate(() => document.activeElement?.className)}`);

console.log('\n[5] Bad Case 管理视图');
await page.locator('[data-view="badcases"]').first().click();
await page.waitForTimeout(400);
check('切换到 Bad Case 视图', await page.locator('#badcasesView').isVisible());
const bcRows = await page.locator('#bcBody tr').count();
check('Bad Case 表 7 行', bcRows === 7, `实际 ${bcRows}`);
await page.locator('#bcSeverity').selectOption('critical');
check('筛选「致命」= BC006', (await page.locator('#bcBody tr:visible').count()) === 1 && (await page.locator('#bcBody tr:visible').first().getAttribute('data-bc')) === 'BC006');
await page.locator('#bcSeverity').selectOption('all');
await page.locator('#bcStatus').selectOption('partial');
check('筛选「部分修复」= BC002', (await page.locator('#bcBody tr:visible').count()) === 1 && (await page.locator('#bcBody tr:visible').first().getAttribute('data-bc')) === 'BC002');
await page.locator('#bcStatus').selectOption('all');
const bc005Cell = await page.locator('#bcBody tr[data-bc="BC005"] [data-label="来源 Case"]').textContent();
check('BC005 来源显示未提供（无错误链接）', bc005Cell.includes('未提供') && (await page.locator('#bcBody tr[data-bc="BC005"] [data-open-case]').count()) === 0, bc005Cell);
await page.screenshot({ path: path.join(out, '04-badcase-view.png') });
await page.locator('#bcBody tr[data-bc="BC006"]').click();
await page.waitForTimeout(350);
check('BC006 详情 Drawer', await page.locator('#drawer').isVisible() && (await page.locator('#drawerTitle').textContent()).includes('身份证'));
check('BC 详情含「根因（人工分析）」', (await page.locator('#drawerBody').textContent()).includes('根因（人工分析）'));
await page.screenshot({ path: path.join(out, '05-bc-drawer.png') });
await page.locator('#drawerBody [data-open-case="E007"]').click();
await page.waitForTimeout(300);
check('BC→Case 跳转（E007 详情）', (await page.locator('#drawerTitle').textContent()).includes('身份证号'));
await page.keyboard.press('Escape');

console.log('\n[6] 搜索与错误状态');
await page.locator('[data-view="overview"]').first().click();
await page.waitForTimeout(300);
await page.locator('#caseSearch').fill('身份证');
check('搜索「身份证」= E007', JSON.stringify(await visibleCaseIds()) === JSON.stringify(['E007']), JSON.stringify(await visibleCaseIds()));
await page.locator('#caseSearch').fill(' ');
await page.locator('#caseSearch').press('Enter');
const errState = await page.evaluate(() => ({
  wrapperError: document.getElementById('searchForm').classList.contains('is-error'),
  errorVisible: getComputedStyle(document.getElementById('searchError')).display !== 'none',
  activeId: document.activeElement?.id,
}));
check('空提交触发错误态', errState.wrapperError && errState.errorVisible && errState.activeId === 'caseSearch', JSON.stringify(errState));
await page.screenshot({ path: path.join(out, '06-search-error.png') });
await page.locator('#clearSearch').click();
check('清空搜索按钮可用', (await page.locator('.case-row:visible').count()) === 8);

console.log('\n[7] Tabs 键盘（roving tabindex）');
await page.locator('#tab-all').focus();
const before = await page.evaluate(() => [...document.querySelectorAll('#caseTabs [role=tab]')].map((t) => t.tabIndex));
check('roving tabindex 初始态', JSON.stringify(before) === JSON.stringify([0, -1, -1, -1]), JSON.stringify(before));
await page.keyboard.press('ArrowRight');
const afterRight = await page.evaluate(() => ({
  active: document.activeElement?.dataset?.filter,
  selected: document.querySelector('#caseTabs [aria-selected="true"]')?.dataset?.filter,
}));
check('ArrowRight → 选中 Good', afterRight.active === 'good' && afterRight.selected === 'good', JSON.stringify(afterRight));
await page.keyboard.press('Home');
check('Home → 全部', (await page.evaluate(() => document.activeElement?.dataset?.filter)) === 'all');
await page.keyboard.press('End');
check('End → Bad', (await page.evaluate(() => document.activeElement?.dataset?.filter)) === 'bad');
await page.locator('#tab-all').click();

console.log('\n[8] 对比度与触摸目标（桌面）');
function auditInPage() {
  function parseColor(v) {
    const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: Number.isFinite(p[3]) ? p[3] : 1 };
  }
  function blend(fg, bg) { return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 }; }
  function background(el) {
    const stack = []; let n = el;
    while (n) { const c = parseColor(getComputedStyle(n).backgroundColor); if (c && c.a > 0) stack.push(c); n = n.parentElement; }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) out = blend(stack[i], out);
    return out;
  }
  function lum(c) { const q = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * q[0] + 0.7152 * q[1] + 0.0722 * q[2]; }
  function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  const contrast = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const direct = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent.trim()).join(' ');
    if (!direct) continue;
    const s = getComputedStyle(el), bg = background(el), raw = parseColor(s.color); if (!raw) continue;
    const fg = blend(raw, bg), size = parseFloat(s.fontSize), weight = parseInt(s.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700), required = large ? 3 : 4.5, value = ratio(fg, bg);
    contrast.push({ text: direct.slice(0, 60), ratio: +value.toFixed(2), required, pass: value >= required });
  }
  const targets = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="tab"], [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }))
    .map((el) => { const r = el.getBoundingClientRect(); return { tag: el.tagName, id: el.id, text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 50), width: +r.width.toFixed(1), height: +r.height.toFixed(1), pass: r.width >= 44 && r.height >= 44 }; });
  return { contrast, targets };
}
const desktopAudit = await page.evaluate(auditInPage);
const dContrastFail = desktopAudit.contrast.filter((x) => !x.pass);
const dTargetFail = desktopAudit.targets.filter((x) => !x.pass);
check('桌面对比度全部通过', dContrastFail.length === 0, `失败 ${dContrastFail.length} 项：${JSON.stringify(dContrastFail.slice(0, 5))}`);
check('桌面触摸目标全部 ≥44px', dTargetFail.length === 0, `失败 ${dTargetFail.length} 项：${JSON.stringify(dTargetFail.slice(0, 8))}`);

console.log('\n[9] 移动端 375px');
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1000);
await scrollThrough();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
check('无横向溢出', overflow <= 1, `溢出 ${overflow}px`);
const mobileCards = await firstScreenCards();
const mCardFail = mobileCards.filter((c) => c.ratio > 0.35);
check('移动端首屏卡片可见高度均 ≤35% 视口', mCardFail.length === 0, JSON.stringify(mCardFail));
check('移动端汉堡按钮可见', await page.locator('#mobileMenuButton').isVisible());
await page.locator('#mobileMenuButton').click();
check('移动端菜单打开', await page.locator('#mobileMenu').isVisible());
await page.keyboard.press('Escape');
await page.screenshot({ path: path.join(out, '07-mobile-375.png') });
await page.locator('#cases').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.locator('.case-row[data-case-id="E001"] .case-trigger').click();
await page.waitForTimeout(400);
const mobileExp = await page.locator('.case-row[data-case-id="E001"] .compare-panel').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
check('移动端 Before/After 单列', mobileExp.split(' ').length === 1, mobileExp);
await page.locator('.case-row[data-case-id="E001"] [data-open-case="E001"]').click();
await page.waitForTimeout(400);
check('移动端 Drawer 全宽', await page.locator('.drawer-panel').evaluate((el) => el.getBoundingClientRect().width) <= 377);
await page.screenshot({ path: path.join(out, '08-mobile-case-detail.png') });
await page.keyboard.press('Escape');
const mobileAudit = await page.evaluate(auditInPage);
const mContrastFail = mobileAudit.contrast.filter((x) => !x.pass);
const mTargetFail = mobileAudit.targets.filter((x) => !x.pass);
check('移动端对比度全部通过', mContrastFail.length === 0, `失败 ${mContrastFail.length} 项：${JSON.stringify(mContrastFail.slice(0, 5))}`);
check('移动端触摸目标全部 ≥44px', mTargetFail.length === 0, `失败 ${mTargetFail.length} 项：${JSON.stringify(mTargetFail.slice(0, 8))}`);

console.log('\n[10] 控制台');
check('控制台 0 error', consoleErrors.length === 0, JSON.stringify(consoleErrors.slice(0, 5)));
const cdnWarnings = consoleMessages.filter((m) => /tailwind|cdn/i.test(m.text));
check('无 CDN 警告', cdnWarnings.length === 0, JSON.stringify(cdnWarnings.slice(0, 3)));

const result = {
  url,
  summaryHeight: Math.round(summaryH),
  issueDefaultVisible: issueVisible,
  consoleErrors,
  consoleMessages,
  contrast: {
    desktop: { total: desktopAudit.contrast.length, failures: dContrastFail },
    mobile: { total: mobileAudit.contrast.length, failures: mContrastFail },
  },
  touch: {
    desktop: { total: desktopAudit.targets.length, failures: dTargetFail },
    mobile: { total: mobileAudit.targets.length, failures: mTargetFail },
  },
  failures,
};
fs.writeFileSync(path.join(out, 'browser-audit.json'), JSON.stringify(result, null, 2));
console.log('\n================ FAILURES ================');
if (failures.length) failures.forEach((f) => console.log('  ✗', f));
else console.log('  （无）');
console.log(`对比度 桌面 ${desktopAudit.contrast.length} 项/失败 ${dContrastFail.length}；移动 ${mobileAudit.contrast.length} 项/失败 ${mContrastFail.length}`);
console.log(`触摸目标 桌面 ${desktopAudit.targets.length} 项/失败 ${dTargetFail.length}；移动 ${mobileAudit.targets.length} 项/失败 ${mTargetFail.length}`);
console.log(`控制台错误 ${consoleErrors.length}`);
await browser.close();
process.exit(failures.length ? 1 : 0);
