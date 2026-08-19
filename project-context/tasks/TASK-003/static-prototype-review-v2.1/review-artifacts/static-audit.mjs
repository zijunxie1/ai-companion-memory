import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..', '..', '..', '..');
const root = path.join(projectRoot, 'prototypes', 'task-003-eval-console-v2.1');
const out = scriptDir;
fs.mkdirSync(out, { recursive: true });

const htmlPath = path.join(root, 'index.html');
const cssSrcPath = path.join(root, 'src', 'input.css');
const cssDistPath = path.join(root, 'dist', 'app.css');
const specPath = path.join(root, 'design-spec-v2-implementation.md');
const dataPath = 'E:\\正式作品\\v2\\app\\src\\lib\\eval-data.ts';

const html = fs.readFileSync(htmlPath, 'utf8');
const cssSrc = fs.existsSync(cssSrcPath) ? fs.readFileSync(cssSrcPath, 'utf8') : '';
const cssDist = fs.existsSync(cssDistPath) ? fs.readFileSync(cssDistPath, 'utf8') : '';
const spec = fs.readFileSync(specPath, 'utf8');
// 动态产品分支不再保留旧静态 eval-data.ts；迁移后的原型审计回读其最后批准提交。
const data = fs.existsSync(dataPath)
  ? fs.readFileSync(dataPath, 'utf8')
  : execFileSync('git', ['show', 'd344703:v2/app/src/lib/eval-data.ts'], {
      cwd: projectRoot,
      encoding: 'utf8',
    });

const SPEC_COLORS = [
  '#F6F7F9', '#FFFFFF', '#1C1D21', '#70747D', '#5F625C', '#E2E4EA', '#6E5BAA',
  '#2F9364', '#E6F4EC', '#BE8128', '#FFF3D8', '#C94E49', '#FCE9E7', '#7D817A', '#EFEFEB'
];
const SPEC_COLOR_SET = new Set(SPEC_COLORS.map((c) => c.toUpperCase()));
const SPEC_FONT_SIZES = new Set([48, 24, 16, 14, 12, 10]);
const SPEC_RADII = new Set([12, 8]);

function normalizeHex(raw) {
  let h = raw.toUpperCase();
  if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
  if (h === '#FFFFFF') h = '#FFF'; // Tailwind 压缩形式
  return h;
}

const ALLOWED_COLORS = new Set(SPEC_COLORS.map(normalizeHex));

function collectHex(text) {
  const map = new Map();
  for (const m of text.matchAll(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g)) {
    const hex = normalizeHex(m[0]);
    const item = map.get(hex) ?? { hex, count: 0 };
    item.count += 1;
    map.set(hex, item);
  }
  return [...map.values()].sort((a, b) => a.hex.localeCompare(b.hex));
}

function collectFontSizes(text) {
  const map = new Map();
  for (const m of text.matchAll(/font-size\s*:\s*([^;]+);/g)) {
    const v = m[1].trim();
    const item = map.get(v) ?? { value: v, count: 0 };
    item.count += 1;
    map.set(v, item);
  }
  return [...map.values()].sort((a, b) => a.value.localeCompare(b.value));
}

function collectRadii(text) {
  const map = new Map();
  for (const m of text.matchAll(/border-radius\s*:\s*([^;]+);/g)) {
    const v = m[1].trim();
    const item = map.get(v) ?? { value: v, count: 0 };
    item.count += 1;
    map.set(v, item);
  }
  return [...map.values()].sort((a, b) => a.value.localeCompare(b.value));
}

const failures = [];
const warnings = [];

// ---------- 1. HTML 不允许出现任何 Hex（颜色全部走 Token 类） ----------
const htmlHex = collectHex(html);
if (htmlHex.length) failures.push(`index.html 含 ${htmlHex.length} 个内联 Hex：${htmlHex.map((x) => x.hex).join(', ')}`);

// ---------- 2. CSS 产物颜色必须严格等于 15 Token ----------
const distHex = collectHex(cssDist);
const distColors = distHex.filter((x) => x.hex !== '#0000').map((x) => x.hex);
const stray = distColors.filter((x) => !ALLOWED_COLORS.has(x));
const missing = SPEC_COLORS.map((c) => normalizeHex(c)).filter((c) => !distColors.includes(c));
if (stray.length) failures.push(`dist/app.css 含规范外颜色：${stray.join(', ')}`);
if (missing.length) failures.push(`dist/app.css 缺少 Token：${missing.join(', ')}`);

// ---------- 3. 字号：产物中所有值必须在 6 档内 ----------
const distFonts = collectFontSizes(cssDist);
const fontVars = [...cssDist.matchAll(/--text-([a-z0-9-]+):\s*(\d+)px/g)].map((m) => +m[2]);
const fontInline = distFonts.filter((x) => /^\d+px$/.test(x.value)).map((x) => parseFloat(x.value));
const allFonts = [...new Set([...fontVars, ...fontInline])];
const strayFonts = allFonts.filter((v) => !SPEC_FONT_SIZES.has(v));
if (strayFonts.length) failures.push(`产物含规范外字号：${strayFonts.join(', ')}px（允许 48/24/16/14/12/10）`);

// ---------- 4. 圆角：产物中所有值必须在 8/12 内 ----------
const distRadii = collectRadii(cssDist);
const radiiVars = [...cssDist.matchAll(/--radius-([a-z0-9-]+):\s*(\d+)px/g)].map((m) => +m[2]);
const radiiInline = distRadii.filter((x) => /^\d+px$/.test(x.value)).map((x) => parseFloat(x.value));
const allRadii = [...new Set([...radiiVars, ...radiiInline])];
const strayRadii = allRadii.filter((v) => !SPEC_RADII.has(v));
if (strayRadii.length) failures.push(`产物含规范外圆角：${strayRadii.join(', ')}px（允许 8/12）`);

// ---------- 5. 状态类型：只允许四类，无 Review ----------
const statusClasses = [...new Set([...html.matchAll(/status-(success|warning|error|neutral|review)\b/g)].map((m) => m[1]))];
const extraStatus = statusClasses.filter((s) => !['success', 'warning', 'error', 'neutral'].includes(s));
if (extraStatus.length) failures.push(`存在规范外状态类：${extraStatus.join(', ')}`);
if (/status-review|--review/.test(html)) failures.push('index.html 仍引用 status-review / --review');
if (/--review\s*:/i.test(cssSrc)) failures.push('src/input.css 仍定义 review 色');

// ---------- 6. 不使用 Tailwind Play CDN ----------
if (/cdn\.tailwindcss\.com|unpkg\.com\/tailwindcss|tailwindcss@\d/.test(html)) {
  failures.push('index.html 仍引用 Tailwind Play CDN 或远程 Tailwind');
}
if (/<script[^>]*src=/i.test(html)) failures.push('index.html 仍存在外部 <script src>（应完全本地化）');

// ---------- 7. 用例数据一致性（eval-data.ts vs index.html） ----------
function getCaseSegments(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  const slice = text.slice(start, end > start ? end : undefined);
  const matches = [...slice.matchAll(/\bid:\s*"(E\d{3})"/g)];
  return matches.map((m, i) => ({ id: m[1], block: slice.slice(m.index, matches[i + 1]?.index ?? slice.length) }));
}
const sourceCases = getCaseSegments(data, 'export const caseComparisons', '// ---- 强约束指标').map(({ id, block }) => {
  const scores = [...block.matchAll(/score:\s*"([^"]+)"/g)].map((m) => m[1]);
  const gsb = block.match(/gsb:\s*"([^"]+)"/)?.[1];
  return { id, before: scores[0] ?? null, after: scores[1] ?? null, gsb };
});
const htmlCases = [...html.matchAll(/<article class="case-row"[\s\S]*?(?=<article class="case-row"|<\/div>\s*<div id="emptyState")/g)].map((m) => {
  const block = m[0];
  const id = block.match(/>\s*(E\d{3})\s*</)?.[1];
  const gsbRaw = block.match(/data-gsb="([^"]+)"/)?.[1];
  const gsb = gsbRaw === 'na' ? 'not_applicable' : gsbRaw;
  const scoreText = block.match(/class="case-score[^"]*"[^>]*>([\s\S]*?)<\/span>\s*<span class="case-status/)?.[1] ?? '';
  const clean = scoreText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = clean.split('→').map((s) => s.trim());
  return { id, gsb, before: parts[0] ?? null, after: parts[1] ?? null };
}).filter((x) => x.id);
const missingCases = sourceCases.filter((s) => !htmlCases.some((h) => h.id === s.id)).map((x) => x.id);
if (sourceCases.length !== 8) failures.push(`eval-data.ts Case 数应为 8，实际 ${sourceCases.length}`);
if (missingCases.length) failures.push(`index.html 缺少 Case：${missingCases.join(', ')}`);
for (const s of sourceCases) {
  const h = htmlCases.find((x) => x.id === s.id);
  if (!h) continue;
  if (h.before !== s.before || h.after !== s.after) failures.push(`${s.id} 分数不一致：数据源 ${s.before}→${s.after}，页面 ${h.before}→${h.after}`);
  if (h.gsb !== s.gsb) failures.push(`${s.id} GSB 不一致：数据源 ${s.gsb}，页面 ${h.gsb}`);
}
const gsbCounts = sourceCases.reduce((acc, c) => { acc[c.gsb] = (acc[c.gsb] ?? 0) + 1; return acc; }, {});
const gsbOk = gsbCounts.good === 3 && gsbCounts.same === 2 && gsbCounts.bad === 2 && gsbCounts.not_applicable === 1;
if (!gsbOk) failures.push(`GSB 分布异常：${JSON.stringify(gsbCounts)}（期望 good:3 same:2 bad:2 not_applicable:1）`);

// ---------- 8. BC 映射 ----------
function getBcSegments(text) {
  const start = text.indexOf('export const badCases');
  const slice = text.slice(start);
  const matches = [...slice.matchAll(/\bid:\s*"(BC\d{3})"/g)];
  return matches.map((m, i) => ({ id: m[1], block: slice.slice(m.index, matches[i + 1]?.index ?? slice.length) }));
}
const bcBlocks = getBcSegments(data);
const bc006 = bcBlocks.find((b) => b.block.includes('"BC006"'))?.block ?? '';
const bc007 = bcBlocks.find((b) => b.block.includes('"BC007"'))?.block ?? '';
if (!/sourceCase:\s*"E007"/.test(bc006)) failures.push('BC006 sourceCase 应为 E007（身份证隐私 Case）');
if (!/sourceCase:\s*"E008"/.test(bc007)) failures.push('BC007 sourceCase 应为 E008（不想活了 Case）');

// ---------- 9. 本次发现 = 4 条 ----------
const issueCount = (data.match(/\bid:\s*"N\d"/g) ?? []).length;
if (issueCount !== 4) failures.push(`newIssues 应为 4 条，实际 ${issueCount}`);
if (!/hypothesis:/i.test(data)) failures.push('eval-data.ts NewIssue 未使用「hypothesis（原因假设）」字段名');
const htmlIssueCount = (html.match(/\{ id: "N\d"/g) ?? []).length;
if (htmlIssueCount !== 4) failures.push(`页面 ISSUES 数据应为 4 条，实际 ${htmlIssueCount}`);

// ---------- 10. 口号与旧文案清理 ----------
const bannedCopy = [
  'MULTI-DIMENSIONAL EVIDENCE', 'MEMORY JOURNEY MAP', 'PRIORITY QUEUE',
  '指标不是一个分数', 'Memory 更可信了', 'Research evaluation report',
  '核心结论 · Strong constraint', 'humanized data atelier'
];
for (const b of bannedCopy) {
  if (html.toLocaleLowerCase().includes(b.toLocaleLowerCase())) failures.push(`仍存在口号式文案：${b}`);
}
const eyebrowCount = (html.match(/class="eyebrow/g) ?? []).length;
if (eyebrowCount) failures.push(`仍存在 ${eyebrowCount} 处 eyebrow 装饰类`);

// ---------- 11. 缺失数据标记（静态源仅含模板定义；运行时由 JS 渲染多处） ----------
const naCount = (html.match(/未采集/g) ?? []).length;
if (naCount < 1) warnings.push('页面静态源未出现「未采集」标记，确认 Trace 缺失项是否覆盖');

// ---------- 12. 无障碍静态要素 ----------
const ariaChecks = [
  ['role=tablist', /role="tablist"/],
  ['role=tab', /role="tab"/g],
  ['aria-controls', /aria-controls="caseList"/],
  ['aria-expanded（Case 展开）', /aria-expanded="false"/],
  ['aria-modal Drawer', /role="dialog"[^>]*aria-modal="true"/],
  ['lang=zh-CN', /<html lang="zh-CN">/],
  ['roving tabindex', /tabindex="-1"/],
];
for (const [name, re] of ariaChecks) {
  if (!re.test(html)) failures.push(`缺少无障碍要素：${name}`);
}

const result = {
  files: { htmlPath, cssSrcPath, cssDistPath, specPath, dataPath },
  colors: { htmlInline: htmlHex, dist: distColors, specTotal: SPEC_COLORS.length },
  fontSizes: { allowed: [48, 24, 16, 14, 12, 10], all: allFonts.sort((a, b) => a - b) },
  radii: { allowed: [12, 8], all: allRadii.sort((a, b) => a - b) },
  statusClasses,
  sourceCases,
  htmlCases,
  gsbCounts,
  missingCases,
  bc006Source: bc006.match(/sourceCase:\s*"([^"]+)"/)?.[1],
  bc007Source: bc007.match(/sourceCase:\s*"([^"]+)"/)?.[1],
  issueCount,
  media: [...html.matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].trim()),
  specLoaded: spec.includes('Design Spec V2'),
  failures,
  warnings,
};

fs.writeFileSync(path.join(out, 'static-audit.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  colors: result.colors,
  fontSizes: result.fontSizes,
  radii: result.radii,
  statusClasses,
  sourceCases: sourceCases.map((c) => `${c.id}:${c.gsb}:${c.before}->${c.after}`),
  htmlCases: htmlCases.map((c) => `${c.id}:${c.gsb}:${c.before}->${c.after}`),
  gsbCounts,
  bc006Source: result.bc006Source, bc007Source: result.bc007Source,
  issueCount,
  failures,
  warnings,
}, null, 2));
process.exit(failures.length ? 1 : 0);
