#!/usr/bin/env node
// nexus-board · the room screen: gates of both squads, the contract chain reacting to changes, the publication feed.
// It only reads the Context Nexus Git repo: no access to squads' machines, no database.
//
//   node tools/nexus-board.mjs --pull 10                    # room screen: http://localhost:4000
//   node tools/nexus-board.mjs --pull 10 --keeper --push    # gate keeper station: record verdicts, fire the event
//
// Options: --port 4000 · --host 127.0.0.1 (0.0.0.0 to let other machines open it read-only) · --nexus <dir>
//          --pull <seconds> (regular git pull) · --keeper (enables writes, from this machine only) · --push

import http from 'node:http';
import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { TOOLS_DIR, DEFAULT_NEXUS, loadConfig, loadNexus, squadOf, checkPins, gateVerdicts, isoNow } from './lib/nexus.mjs';
import { applyEvent, loadEvent } from './event.mjs';

function parseArgs(argv) {
  const a = { port: 4000, host: '127.0.0.1', pull: 0 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--port') a.port = Number(argv[++i]);
    else if (k === '--host') a.host = argv[++i];
    else if (k === '--nexus') a.nexus = argv[++i];
    else if (k === '--pull') a.pull = Number(argv[++i]);
    else if (k === '--keeper') a.keeper = true;
    else if (k === '--push') a.push = true;
    else if (k === '--help' || k === '-h') a.help = true;
  }
  return a;
}

const git = (nexus, args) => execFileSync('git', ['-C', nexus, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 });
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
const GATES = ['G1', 'G2', 'G3', 'G4'];

function buildState(ctx) {
  const { nexus, config } = ctx;
  const artifacts = loadNexus(nexus);
  const squads = Object.entries(config.squads).map(([id, s]) => {
    const own = [...artifacts.values()].filter(a => squadOf(a.path) === id);
    const issues = own.flatMap(a => checkPins(a, artifacts).map(i => ({ ...i, from: a.path })));
    const verdicts = gateVerdicts(nexus, id);
    const next = GATES.find(g => verdicts[g]?.verdict !== 'GO') || null;
    return {
      id, number: s.number, label: s.label, slice: s.slice,
      gates: GATES.map(g => ({ gate: g, name: config.gates[g].name, ...(verdicts[g] || {}) })),
      next,
      artefacts: own.filter(a => a.meta.register !== 'process' || a.meta.version)
        .map(a => ({ path: a.path, name: a.path.split('/').pop().replace(/\.md$/, ''), register: a.meta.register, version: a.meta.version, status: a.meta.status })),
      stale: own.filter(a => a.meta.status === 'stale').length + issues.length,
      issues,
    };
  });

  // Contract chain: programme rules → reference cases → each squad's published contract, in config order (A → B → C).
  const node = (path, label) => {
    const a = artifacts.get(path);
    return { path, label, version: a?.meta.version || '—', status: a?.meta.status || 'missing', issues: a ? checkPins(a, artifacts).length : 0 };
  };
  const chain = [
    node('programme/payment-reminders/knowledge/business-rules.md', 'Business rules'),
    node('programme/payment-reminders/contracts/reference-cases.md', 'Reference cases'),
    ...Object.values(config.squads).flatMap(s => (s.publishes || []).map(p => node(p, `${s.number} · ${p.split('/').pop().replace(/\.md$/, '')}`))),
  ];

  const feed = safe(() => git(nexus, ['log', '-15', '--date=iso-strict', '--pretty=format:%cd%x09%an%x09%s']).split('\n').filter(Boolean)
    .map(l => { const [at, who, subject] = l.split('\t'); return { at, who, subject }; }), []);

  let event = null;
  if (config.event) {
    const e = safe(() => loadEvent(config.event), null);
    const appliedAt = safe(() => git(nexus, ['log', '-1', '--date=iso-strict', '--pretty=format:%cd', '--grep', `^facilitation: .*${e.changes[0].newVersion}`]).trim(), '');
    const applied = !!e && e.changes.every(c => artifacts.get(c.artifact)?.meta.version === c.newVersion);
    event = e && { id: e.id, title: e.title, say: e.say, applied, appliedAt: applied ? appliedAt : null };
  }
  return { now: isoNow(), title: config.title, keeper: ctx.keeper, squads, chain, feed, event, gates: config.gates };
}

function writeVerdict(ctx, body) {
  const { nexus, config } = ctx;
  const { squad, gate, verdict, keeper, note } = body;
  if (!config.squads[squad] || !GATES.includes(gate) || !['GO', 'NO-GO'].includes(verdict)) throw new Error('Invalid verdict.');
  if (!keeper || !note) throw new Error('A verdict needs the gate keeper\'s name and a reason.');
  const clean = s => String(s).replace(/[|\n]/g, ' ').trim();
  const file = join(nexus, 'teams', squad, 'operations', 'gates-journal.md');
  mkdirSync(dirname(file), { recursive: true });
  if (!existsSync(file)) writeFileSync(file, `# Gates journal · ${squad}\n\n| at | gate | verdict | gate keeper | reason |\n|---|---|---|---|---|\n`);
  appendFileSync(file, `| ${isoNow()} | ${gate} | ${verdict} | ${clean(keeper)} | ${clean(note)} |\n`);
  const rel = `teams/${squad}/operations/gates-journal.md`;
  git(nexus, ['add', rel]);
  git(nexus, ['-c', `user.name=${clean(keeper)}`, '-c', 'user.email=gate-keeper@hackathon.local', 'commit', '-m', `${squad}: ${gate} ${verdict} (${clean(keeper)})`]);
  if (ctx.push) safe(() => { git(nexus, ['pull', '--rebase', '--autostash']); git(nexus, ['push']); }, null);
  return `${gate} ${verdict} recorded for ${squad}`;
}

const json = (res, code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
const isLocal = req => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log('Usage: node tools/nexus-board.mjs [--pull <s>] [--keeper] [--push] [--port 4000] [--host 127.0.0.1] [--nexus <dir>]'); return; }
  const ctx = { nexus: resolve(args.nexus || DEFAULT_NEXUS), config: loadConfig(), keeper: !!args.keeper, push: !!args.push };
  const page = () => readFileSync(join(TOOLS_DIR, 'board', 'index.html'), 'utf8');
  if (args.pull > 0) setInterval(() => safe(() => git(ctx.nexus, ['pull', '--rebase', '--autostash', '--quiet']), null), args.pull * 1000);

  http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    try {
      if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(page()); }
      if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, buildState(ctx));
      if (req.method === 'POST' && ['/api/gate', '/api/event'].includes(url.pathname)) {
        if (!ctx.keeper || !isLocal(req)) return json(res, 403, { ok: false, message: 'Writes are only accepted on the gate keeper station (--keeper, localhost).' });
        let raw = '';
        req.on('data', c => { raw += c; });
        req.on('end', () => {
          try {
            const body = JSON.parse(raw || '{}');
            if (url.pathname === '/api/gate') return json(res, 200, { ok: true, message: writeVerdict(ctx, body) });
            const r = applyEvent({ id: ctx.config.event, nexus: ctx.nexus, push: ctx.push });
            return json(res, 200, { ok: true, message: r.log.join(' · ') });
          } catch (e) { return json(res, 400, { ok: false, message: e.message }); }
        });
        return;
      }
      json(res, 404, { ok: false });
    } catch (e) { json(res, 500, { ok: false, message: e.message }); }
  }).listen(args.port, args.host, () => {
    console.log(`Room board: http://${args.host === '0.0.0.0' ? 'localhost' : args.host}:${args.port}${ctx.keeper ? '  (gate keeper mode: writes enabled from this machine)' : ''}`);
    console.log(`Nexus: ${ctx.nexus}`);
  });
}

main();
