/**
 * 15-seo-run.mjs — runs the WP Phase 9 SEO scripts through the Novamira CLI (D-046, D-048): 15-seo.php and
 * 15-seo-social.php with scripts/wp/seo-meta.json as $META, 16-schema.php without data. Dry run by default; only --write
 * lets the script write to WordPress.
 *   node scripts/wp/15-seo-run.mjs 15-seo.php            dry run: reports what would change, writes nothing
 *   node scripts/wp/15-seo-run.mjs 15-seo-social.php --write
 * Builds the Novamira input {"code": "[$META = json_decode(base64_decode('…'), true);\n]$DRY = true;\n<script>"} (with --write
 * "$WRITE = true;\n" instead of the $DRY line: 16-schema.php writes only then; 15-seo.php / 15-seo-social.php write whenever
 * $DRY is missing, so run them through this runner only) in the OS temp
 * folder (deleted afterwards) and calls `novamira --site <seo-config.json site> run novamira/execute-php` with
 * NODE_OPTIONS=--use-system-ca (LocalWP's certificate). Prints Novamira's response (the script's JSON report in "output").
 * Exit code: 0 only when Novamira reports success and the script's report has no "error" (e.g. "META and published pages
 * differ, nothing written"); 1 otherwise, also when the response cannot be read; 2 for wrong arguments.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Script → whether it needs seo-meta.json as $META.
const SCRIPTS = { '15-seo.php': true, '15-seo-social.php': true, '16-schema.php': false };
const args = process.argv.slice(2);
const scripts = args.filter((a) => !a.startsWith('--'));
const script = scripts[0];
const write = args.includes('--write');
const unknown = args.filter((a) => a.startsWith('--') && a !== '--write');
if (scripts.length !== 1 || !Object.hasOwn(SCRIPTS, script) || unknown.length) {
  console.error(`usage: node scripts/wp/15-seo-run.mjs <${Object.keys(SCRIPTS).join(' | ')}> [--write]`);
  process.exit(2);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const { site } = JSON.parse(readFileSync(path.join(dir, 'seo-config.json'), 'utf8'));
const meta = SCRIPTS[script] ? readFileSync(path.join(dir, 'seo-meta.json')) : null;
const code = (meta ? `$META = json_decode(base64_decode('${meta.toString('base64')}'), true);\n` : '') + (write ? '$WRITE = true;\n' : '$DRY = true;\n') + readFileSync(path.join(dir, script), 'utf8');
const input = path.join(tmpdir(), `tp-seo-run-${process.pid}.json`);
writeFileSync(input, JSON.stringify({ code }));

console.error(`${write ? 'WRITE' : 'DRY RUN'}: ${script} on ${site}${meta ? ` (${JSON.parse(meta).length} pages in seo-meta.json)` : ''}`);
try {
  const r = spawnSync('novamira', ['--site', site, 'run', 'novamira/execute-php', '--input', `"@${input}"`, '--yes'], {
    stdio: ['inherit', 'pipe', 'inherit'],
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, NODE_OPTIONS: [process.env.NODE_OPTIONS, '--use-system-ca'].filter(Boolean).join(' ') },
  });
  process.stdout.write(r.stdout || '');
  let problem = r.status !== 0 ? `novamira exit ${r.status}` : '';
  if (!problem) {
    try {
      const response = JSON.parse(r.stdout.slice(r.stdout.indexOf('{'), r.stdout.lastIndexOf('}') + 1));
      const report = JSON.parse(response.output);
      if (!response.success || response.errors?.length) problem = 'novamira reported failure';
      else if (report.error) problem = `script stopped: ${report.error}`;
    } catch (e) {
      problem = `unreadable response (${e.message})`;
    }
  }
  if (problem) console.error(`FAILED: ${problem}`);
  process.exitCode = problem ? 1 : 0;
} finally {
  rmSync(input, { force: true });
}
