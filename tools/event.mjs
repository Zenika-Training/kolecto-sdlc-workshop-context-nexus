#!/usr/bin/env node
// event · the scripted business change of the hackathon. Facilitator only.
// Rehearse it on a copy of the Nexus first (--no-commit, then undo).
//
//   node tools/event.mjs list
//   node tools/event.mjs card 01-fees-v2            # what to read aloud (writes nothing)
//   node tools/event.mjs apply 01-fees-v2 --push    # apply, commit, push
//   node tools/event.mjs undo 01-fees-v2 --push     # revert (rehearsal)
//
// events/<id>/event.json:
//   { id, title, say, announce, commitMessage,
//     changes:  [ { artifact, newVersion, append?: <file>, replaceBody?: <file>, set?: { <frontmatter key>: <value> } } ],
//     newFiles: [ { from: <file>, to: <nexus path> } ] }
// Each change bumps `version` and `last-validated` in the artefact's frontmatter, then either appends a section
// or replaces the body. Nothing else in the file is touched, so conflicts with squads' work stay unlikely.

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { TOOLS_DIR, DEFAULT_NEXUS, parseFrontmatter, cmpVersion, today } from './lib/nexus.mjs';

const EVENTS = join(TOOLS_DIR, 'events');
const STATE = join(TOOLS_DIR, '.events-state');
const AUTHOR = ['-c', 'user.name=facilitation', '-c', 'user.email=facilitation@hackathon.local'];

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--nexus') a.nexus = argv[++i];
    else if (k === '--push') a.push = true;
    else if (k === '--no-commit') a.noCommit = true;
    else a._.push(k);
  }
  return a;
}

const git = (nexus, args) => execFileSync('git', ['-C', nexus, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
export const loadEvent = id => JSON.parse(readFileSync(join(EVENTS, id, 'event.json'), 'utf8'));
export const listEvents = () => existsSync(EVENTS) ? readdirSync(EVENTS).filter(n => existsSync(join(EVENTS, n, 'event.json'))) : [];

function card(id) {
  const e = loadEvent(id);
  console.log(`EVENT · ${e.title}\n\nRead aloud, without comment:\n${e.say}\n\nFor the facilitator (do not read): ${e.announce}\n\nWhat squads must do: read the change (/contract-diff or git -C ../context-nexus log -p -1), update spec, criteria and tests, re-pin, publish.`);
}

export function applyEvent({ id, nexus, push = false, noCommit = false }) {
  const e = loadEvent(id);
  const snapshot = { changes: [], created: [] };
  for (const c of e.changes) {
    const file = join(nexus, c.artifact);
    if (!existsSync(file)) throw new Error(`Artefact not found: ${c.artifact}`);
    const text = readFileSync(file, 'utf8');
    const current = parseFrontmatter(text)?.meta.version;
    if (!current) throw new Error(`Unreadable frontmatter in ${c.artifact}.`);
    if (cmpVersion(current, c.newVersion) >= 0) throw new Error(`Already applied: ${c.artifact} is at ${current}.`);
    snapshot.changes.push({ artifact: c.artifact, before: text, from: current });
  }
  for (const f of e.newFiles || []) if (!existsSync(join(nexus, f.to))) snapshot.created.push(f.to);
  mkdirSync(STATE, { recursive: true });
  writeFileSync(join(STATE, `${id}.json`), JSON.stringify(snapshot, null, 2));

  const log = [];
  for (const [i, c] of e.changes.entries()) {
    const text = snapshot.changes[i].before;
    const m = text.match(/^---\n([\s\S]*?)\n---\n/);
    let front = m[1].replace(/^version:.*$/m, `version: ${c.newVersion}`).replace(/^last-validated:.*$/m, `last-validated: ${today()}`);
    for (const [k, v] of Object.entries(c.set || {})) front = front.replace(new RegExp(`^${k}:.*$`, 'm'), `${k}: ${v}`);
    let body = text.slice(m[0].length);
    if (c.replaceBody) body = readFileSync(join(EVENTS, id, c.replaceBody), 'utf8');
    if (c.append) body = body.replace(/\s+$/, '\n') + '\n' + readFileSync(join(EVENTS, id, c.append), 'utf8');
    writeFileSync(join(nexus, c.artifact), `---\n${front}\n---\n${body}`);
    log.push(`✓ ${c.artifact}: ${snapshot.changes[i].from} → ${c.newVersion}`);
  }
  for (const f of e.newFiles || []) {
    const dest = join(nexus, f.to);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(join(EVENTS, id, f.from), 'utf8'));
    log.push(`✓ file: ${f.to}`);
  }

  if (!noCommit) {
    git(nexus, ['add', ...e.changes.map(c => c.artifact), ...(e.newFiles || []).map(f => f.to)]);
    git(nexus, [...AUTHOR, 'commit', '-m', e.commitMessage]);
    log.push('✓ committed');
    if (push) {
      try { git(nexus, ['pull', '--rebase', '--autostash']); git(nexus, ['push']); log.push('✓ pushed'); }
      catch (err) { log.push(`✗ cannot push: ${String(err.stderr || err.message).split('\n')[0]}`); }
    }
  }
  return { event: e, log };
}

export function undoEvent({ id, nexus, push = false, noCommit = false }) {
  const e = loadEvent(id);
  const f = join(STATE, `${id}.json`);
  if (!existsSync(f)) throw new Error('No snapshot: nothing to undo.');
  const snap = JSON.parse(readFileSync(f, 'utf8'));
  for (const c of snap.changes) writeFileSync(join(nexus, c.artifact), c.before);
  for (const c of snap.created) rmSync(join(nexus, c), { force: true });
  if (!noCommit) {
    git(nexus, ['add', '-A', ...snap.changes.map(c => c.artifact), ...snap.created]);
    git(nexus, [...AUTHOR, 'commit', '-m', `facilitation: undo ${e.id} (rehearsal)`]);
    if (push) { try { git(nexus, ['pull', '--rebase', '--autostash']); git(nexus, ['push']); } catch { /* no remote */ } }
  }
  rmSync(f, { force: true });
  return snap.changes.map(c => `✓ ${c.artifact} restored to ${c.from}`).join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const a = parseArgs(process.argv.slice(2));
  const [cmd, id] = a._;
  const nexus = resolve(a.nexus || DEFAULT_NEXUS);
  try {
    if (cmd === 'list') for (const ev of listEvents()) console.log(`${ev} · ${loadEvent(ev).title}`);
    else if (cmd === 'card' && id) card(id);
    else if (cmd === 'apply' && id) console.log(applyEvent({ id, nexus, push: a.push, noCommit: a.noCommit }).log.join('\n'));
    else if (cmd === 'undo' && id) console.log(undoEvent({ id, nexus, push: a.push, noCommit: a.noCommit }));
    else console.log('Usage: node tools/event.mjs list | card <id> | apply <id> [--push] [--no-commit] | undo <id> [--push] [--no-commit]   (option: --nexus <dir>)');
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
