#!/usr/bin/env node
// contract-diff · "what changed in what I depend on, and what of mine does it touch?"
// For every pinned dependency of a squad whose version moved, shows the diff between the pinned version and the
// current one, the squad's artefacts that pin it, and the starter files that mention a field that disappeared.
//
//   node tools/contract-diff.mjs --squad squad-b-outreach [--starter <dir>]
//   node tools/contract-diff.mjs --path teams/squad-a-policy/contracts/reminder-decision.md --from 1.0.0

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { DEFAULT_NEXUS, loadNexus, squadOf, checkPins } from './lib/nexus.mjs';

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--squad') a.squad = argv[++i];
    else if (k === '--path') a.path = argv[++i];
    else if (k === '--from') a.from = argv[++i];
    else if (k === '--starter') a.starter = argv[++i];
    else if (k === '--nexus') a.nexus = argv[++i];
    else if (k === '--help' || k === '-h') a.help = true;
  }
  return a;
}

const git = (nexus, args) => execFileSync('git', ['-c', 'color.ui=never', '-c', 'color.diff=never', '-C', nexus, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 });
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

// Most recent commit where `path` had `version: <v>` in its frontmatter.
function commitAtVersion(nexus, path, v) {
  const commits = safe(() => git(nexus, ['log', '--format=%H', '--', path]).split('\n').filter(Boolean), []);
  for (const c of commits) {
    const text = safe(() => git(nexus, ['show', `${c}:${path}`]), '');
    if (new RegExp(`^version:\\s*${v.replace(/\./g, '\\.')}\\s*$`, 'm').test(text)) return c;
  }
  return null;
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(n => {
    if (['node_modules', '.git', 'dist', 'coverage', 'graphify-out', '.context'].includes(n)) return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|md|json)$/.test(n) ? [p] : [];
  });
}

function show(nexus, path, from, consumers, starter) {
  const commit = commitAtVersion(nexus, path, from);
  console.log(`\n━━ ${path}  ${from} → current`);
  if (consumers.length) console.log(`   pinned by: ${consumers.join(', ')}`);
  if (!commit) { console.log(`   (no commit found at version ${from}: showing the last change)`); }
  const diff = safe(() => commit ? git(nexus, ['diff', commit, 'HEAD', '--', path]) : git(nexus, ['log', '-p', '-1', '--', path]), '');
  const changed = diff.split('\n').filter(l => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  console.log(changed.filter(l => !/^[+-](version|last-validated):/.test(l)).slice(0, 60).join('\n') || '   (no textual change)');

  // Identifiers (in backticks, or JSON keys) that only appear on removed lines: likely renamed or removed fields.
  // Change notes (quoted lines) mention old names on purpose: they do not count as "still there".
  const ids = side => new Set([...changed.filter(l => l.startsWith(side) && !l.startsWith(side + '>')).join('\n').matchAll(/`([a-z]\w*[A-Z]\w*)`|"([A-Za-z_]\w*)":/g)].map(m => m[1] || m[2]));
  const gone = [...ids('-')].filter(x => !ids('+').has(x));
  if (gone.length && starter) {
    console.log(`\n   Removed or renamed: ${gone.join(', ')}. Mentioned in your starter:`);
    let hits = 0;
    for (const f of [...files(join(starter, 'src')), ...files(join(starter, 'test')), ...files(join(starter, 'specs'))]) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (hits < 30 && gone.some(g => new RegExp(`\\b${g}\\b`).test(line))) { hits++; console.log(`     ${relative(starter, f)}:${i + 1}  ${line.trim().slice(0, 100)}`); }
      });
    }
    if (!hits) console.log('     (nothing found)');
  }
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.help || (!a.squad && !a.path)) { console.log('Usage: node tools/contract-diff.mjs --squad <squad> [--starter <dir>] | --path <nexus path> --from <version>'); return 0; }
  const nexus = resolve(a.nexus || process.env.NEXUS_DIR || DEFAULT_NEXUS);
  const starter = a.starter ? resolve(a.starter) : (existsSync('package.json') ? process.cwd() : null);
  if (a.path) { show(nexus, a.path, a.from, [], starter); return 0; }

  const artifacts = loadNexus(nexus);
  const moved = new Map();
  for (const art of [...artifacts.values()].filter(x => squadOf(x.path) === a.squad)) {
    for (const i of checkPins(art, artifacts).filter(i => i.kind === 'BREAKING' || i.kind === 'UPDATE')) {
      const key = `${i.path}@${i.pinned}`;
      if (!moved.has(key)) moved.set(key, { ...i, consumers: [] });
      moved.get(key).consumers.push(art.path.split('/').slice(2).join('/'));
    }
  }
  if (!moved.size) { console.log(`✓ Nothing ${a.squad} depends on has changed since it was pinned.`); return 0; }
  for (const i of moved.values()) show(nexus, i.path, i.pinned, i.consumers, starter);
  console.log('\nNext: update spec → plan → tasks → code and tests, re-pin (consumes: …@<current>), set back to active, publish.');
  return 0;
}

process.exit(main());
