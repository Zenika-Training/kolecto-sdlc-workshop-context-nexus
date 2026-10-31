// Shared library for the hackathon tools: reading the Context Nexus, pins, journals.
// No dependency (Node 20+). Every tool reads the same files with the same pinning rules.

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LAYERS = ['org', 'programme', 'teams'];
export const TOOLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_NEXUS = resolve(TOOLS_DIR, '..');

// Frontmatter: single-line `key: value` pairs and inline `[a, b]` lists only. `#` starts a comment.
export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*(#.*)?$/);
    if (!kv) continue;
    let v = kv[2];
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    else if (v === 'null' || v === '') v = null;
    meta[kv[1]] = v;
  }
  return { meta, body: text.slice(m[0].length) };
}

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files = files.concat(walk(p));
    else if (name.endsWith('.md') && name !== 'README.md') files.push(p);
  }
  return files;
}

export function loadNexus(root = DEFAULT_NEXUS) {
  const artifacts = new Map();
  for (const layer of LAYERS) {
    const dir = join(root, layer);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const text = readFileSync(file, 'utf8');
      const fm = parseFrontmatter(text);
      if (!fm) continue;
      const path = relative(root, file).split('\\').join('/');
      artifacts.set(path, { path, file, text, ...fm });
    }
  }
  return artifacts;
}

export const squadOf = path => (path.match(/^teams\/([^/]+)\//) || [])[1] || null;
export const major = v => String(v || '0').split('.')[0];

export function cmpVersion(a, b) {
  const pa = String(a || '0').split('.').map(Number);
  const pb = String(b || '0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

// Compares every pinned dependency (path@version) with the current version of its target.
//   MISSING       the target does not exist
//   BREAKING      the major version changed: the consumer must be reviewed
//   UPDATE        minor or patch change: re-read and re-pin
//   TARGET_STALE  the target itself is stale (or deprecated / superseded)
export function checkPins(artifact, artifacts) {
  const issues = [];
  for (const ref of artifact.meta.consumes || []) {
    const [path, pinned] = ref.split('@');
    const target = artifacts.get(path);
    if (!target) { issues.push({ path, pinned, kind: 'MISSING' }); continue; }
    const current = target.meta.version;
    if (current !== pinned) {
      issues.push({ path, pinned, current, kind: major(current) !== major(pinned) ? 'BREAKING' : 'UPDATE' });
    } else if (['stale', 'deprecated', 'superseded'].includes(target.meta.status)) {
      issues.push({ path, pinned, current, kind: `TARGET_${target.meta.status.toUpperCase()}` });
    }
  }
  return issues;
}

export function setStatus(artifact, status) {
  const text = artifact.text.replace(/^(---\n[\s\S]*?)^status:\s*\S+/m, `$1status: ${status}`);
  writeFileSync(artifact.file, text);
  artifact.text = text;
  artifact.meta.status = status;
}

// Journals are Markdown tables: `| 2026-11-20T14:27:00+01:00 | key | value | who | reason |`
export function parseJournal(text) {
  const rows = [];
  for (const line of String(text || '').split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (!/^\d{4}-\d{2}-\d{2}T/.test(cells[0] || '')) continue;
    rows.push(cells);
  }
  return rows;
}

export function readJournal(root, squad, name) {
  const file = join(root, 'teams', squad, 'operations', name);
  return existsSync(file) ? parseJournal(readFileSync(file, 'utf8')) : [];
}

// Last verdict per gate: { G1: { at, verdict, keeper, note } }
export function gateVerdicts(root, squad) {
  const out = {};
  for (const [at, gate, verdict, keeper, note] of readJournal(root, squad, 'gates-journal.md')) {
    out[gate] = { at, verdict: String(verdict).toUpperCase(), keeper, note };
  }
  return out;
}

// The hackathon runs on Paris time. Codespaces run in UTC, so timestamps are always computed in this zone.
export const DEFAULT_TZ = 'Europe/Paris';

export function zonedParts(date = new Date(), tz = DEFAULT_TZ) {
  const o = {};
  for (const p of new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, s: +o.second };
}

export function isoNow(date = new Date(), tz = DEFAULT_TZ) {
  const pad = n => String(n).padStart(2, '0');
  const p = zonedParts(date, tz);
  const off = Math.round((Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}:${pad(p.s)}${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

export const today = (tz = DEFAULT_TZ) => isoNow(new Date(), tz).slice(0, 10);

export function loadConfig(path = join(TOOLS_DIR, 'hackathon.config.json')) {
  const c = JSON.parse(readFileSync(path, 'utf8'));
  if (!c.timezone) c.timezone = DEFAULT_TZ;
  return c;
}

// Squad detection from a starter folder: explicit flag, then SQUAD env, then `.hackathon/squad`, then folder name.
export function detectSquad(starter, config, explicit) {
  let squad = explicit || process.env.SQUAD;
  if (!squad) { const f = join(starter, '.hackathon', 'squad'); if (existsSync(f)) squad = readFileSync(f, 'utf8').trim(); }
  if (!squad) { const g = starter.split(/[\\/]/).pop().replace(/^starter-/, ''); if (config.squads[g]) squad = g; }
  return squad && config.squads[squad] ? squad : null;
}

// Where is the Nexus, seen from a starter: --nexus, NEXUS_DIR, ../context-nexus, ./context-nexus, else this repo.
export function detectNexus(starter, explicit) {
  if (explicit) return resolve(explicit);
  if (process.env.NEXUS_DIR) return resolve(process.env.NEXUS_DIR);
  for (const c of [join(starter, '..', 'context-nexus'), join(starter, 'context-nexus')]) if (existsSync(join(c, 'teams'))) return resolve(c);
  return DEFAULT_NEXUS;
}
