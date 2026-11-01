#!/usr/bin/env node
// publish · publish the squad's work to the Context Nexus, safely.
// From the starter folder:
//
//   node ../context-nexus/tools/publish.mjs -m "publish business-intent 1.0.0"
//
// In order: shows what will be published, takes ONLY teams/<your-squad>/, commits, pulls the others' work
// (pull --rebase), pushes. If someone published at the same moment, it retries up to 6 times.
// On a real conflict it stops cleanly, keeps your commit, and says what to do.

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadConfig, parseFrontmatter, detectSquad, detectNexus } from './lib/nexus.mjs';

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    // Several -m are joined into paragraphs, as git does: the first one stays the subject.
    if (k === '-m' || k === '--message') a.message = a.message ? `${a.message}\n\n${argv[++i]}` : argv[++i];
    else if (k === '--squad') a.squad = argv[++i];
    else if (k === '--starter') a.starter = argv[++i];
    else if (k === '--nexus') a.nexus = argv[++i];
    else if (k === '--dry-run') a.dry = true;
    else if (k === '--no-push') a.noPush = true;
    else if (k === '--help' || k === '-h') a.help = true;
  }
  return a;
}

const git = (nexus, args) => execFileSync('git', ['-C', nexus, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errText = e => String((e && (e.stderr || e.stdout)) || (e && e.message) || e).trim();
const hasRemote = nexus => { try { return git(nexus, ['remote']).trim().length > 0; } catch { return false; } };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log('Usage: node ../context-nexus/tools/publish.mjs -m "message" [--squad <squad>] [--dry-run] [--no-push]'); return 0; }
  const config = loadConfig();
  const starter = resolve(args.starter || process.cwd());
  const squad = detectSquad(starter, config, args.squad);
  if (!squad) { console.log(`✗ Squad not detected: run from your starter folder, or add --squad (${Object.keys(config.squads).join(' | ')}).`); return 2; }
  const nexus = detectNexus(starter, args.nexus);
  const scope = `teams/${squad}`;

  // 1. What changed
  const porcelain = git(nexus, ['status', '--porcelain', '-uall']).split('\n').filter(Boolean).map(l => ({ code: l.slice(0, 2), path: l.slice(3).replace(/^"|"$/g, '') }));
  const mine = porcelain.filter(f => f.path.startsWith(scope + '/'));
  const others = porcelain.filter(f => !f.path.startsWith(scope + '/'));
  if (others.length) {
    console.log(`⚠ Changed outside ${scope}/, NOT published (a squad only writes in its own folder):`);
    for (const f of others.slice(0, 8)) console.log(`    ${f.path}`);
  }
  if (!mine.length) { console.log(`Nothing to publish in ${scope}/.${others.length ? '' : ' Everything is already published.'}`); return 0; }
  console.log(`About to publish to the Context Nexus (${scope}/):`);
  for (const f of mine) console.log(`    ${f.code.trim() || '?'}  ${f.path}`);

  // 2. Frontmatter hygiene (warnings, never blocking)
  for (const f of mine.filter(f => f.path.endsWith('.md') && existsSync(join(nexus, f.path)))) {
    const fm = parseFrontmatter(readFileSync(join(nexus, f.path), 'utf8'));
    // Spec Kit working files (intent/specs/<feature>/plan.md…) travel without frontmatter, for the next driver.
    if (!fm) { if (!/journal|\/intent\/specs\/[^/]+\//.test(f.path)) console.log(`⚠ ${f.path}: no frontmatter (id, version, status, owner…).`); continue; }
    if (/^</.test(String(fm.meta.owner || ''))) console.log(`⚠ ${f.path}: owner not filled in yet.`);
    if (fm.meta.status === 'draft' && ['contracts', 'intent'].includes(fm.meta.register)) console.log(`⚠ ${f.path}: still draft (a human must review it and set it to active before the gate).`);
    if (fm.meta.status === 'stale') console.log(`⚠ ${f.path}: still stale: read the change, update the pin, set it back to active.`);
  }
  if (args.dry) { console.log('(dry run: nothing published)'); return 0; }

  // 3. Commit this scope and nothing else
  const message = args.message ? `${squad}: ${args.message.replace(new RegExp('^' + squad + '\\s*:\\s*'), '')}` : `${squad}: publish ${mine.length} file(s)`;
  const retryLock = async fn => {
    for (let i = 1; ; i++) {
      try { return fn(); } catch (e) {
        if (i < 6 && /index\.lock|another git process/i.test(errText(e))) { await sleep(200 + Math.floor(Math.random() * 600)); continue; }
        throw e;
      }
    }
  };
  try {
    await retryLock(() => git(nexus, ['add', '--', scope]));
    await retryLock(() => git(nexus, ['commit', '-m', message, '--', scope]));
  } catch (e) { console.log(`✗ Cannot commit: ${errText(e).split('\n')[0]}\n  If Git asks who you are: git config --global user.name "First Last"`); return 1; }
  console.log(`✓ Commit: ${message}`);
  if (args.noPush || !hasRemote(nexus)) { console.log('✓ Published locally (no remote configured, or --no-push).'); return 0; }

  // 4. Pull, then push; retry if someone published at the same moment
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      git(nexus, ['pull', '--rebase', '--autostash', '--quiet']);
    } catch (e) {
      try { git(nexus, ['rebase', '--abort']); } catch { /* no rebase in progress */ }
      console.log(`✗ Conflict while pulling the others' work: ${errText(e).split('\n').filter(l => /CONFLICT|conflict/i.test(l)).slice(0, 3).join(' | ') || errText(e).split('\n')[0]}`);
      console.log(`  Nothing is broken: your commit is kept locally. Someone changed a file in ${scope}/ at the same time.`);
      console.log('  Ask Claude: "There is a conflict publishing to the Context Nexus, help me resolve it."');
      return 1;
    }
    try {
      git(nexus, ['push', '--quiet']);
      const head = git(nexus, ['rev-parse', '--short', 'HEAD']).trim();
      console.log(`✓ Published to the Context Nexus (${head})${attempt > 1 ? `, after ${attempt} attempts: someone was publishing at the same time` : ''}.`);
      console.log('  The other squad gets your changes with /nexus (or: npm run context).');
      return 0;
    } catch (e) {
      if (attempt === 6) { console.log(`✗ Push refused 6 times: ${errText(e).split('\n')[0]}\n  Your commit is kept locally. Check the network, then run the same command again.`); return 1; }
      await sleep(300 + Math.floor(Math.random() * 900));
    }
  }
  return 1;
}

main().then(code => process.exit(code)).catch(e => { console.log(`✗ ${e.message}`); process.exit(1); });
