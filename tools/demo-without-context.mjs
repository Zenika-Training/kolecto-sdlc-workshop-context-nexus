#!/usr/bin/env node
// demo-without-context · the opening demo: the same prompt, without and then with the Nexus context.
// In 3 minutes the room sees what shared context changes: the agent stops inventing.
//
//   node tools/demo-without-context.mjs --squad squad-a-policy           # prepare the empty folder, print instructions
//   node tools/demo-without-context.mjs --squad squad-a-policy --run     # run both answers, one after the other
//
// "With context" = the starter folder (CLAUDE.md, assembled brief, guardrails). Run from there, or pass --starter <dir>.
// --run uses a few thousand tokens.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { loadConfig, detectSquad } from './lib/nexus.mjs';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const config = loadConfig();
const starter = resolve(opt('--starter') || process.cwd());
const squad = detectSquad(starter, config, opt('--squad'));
if (!squad) {
  console.log(`Squad not detected: add --squad (${Object.keys(config.squads).join(' | ')}).`);
  process.exit(0);
}
const cfg = config.squads[squad];
const dir = join(tmpdir(), 'hackathon-without-context', squad);
mkdirSync(dir, { recursive: true });
if (!existsSync(join(dir, '.git'))) { try { execFileSync('git', ['init', '-q'], { cwd: dir }); } catch { /* no git: the folder is enough */ } }
writeFileSync(join(dir, 'README.md'), '# Empty folder\n\nNo context here: no CLAUDE.md, no brief, no contracts.\n');
const prompt = `${cfg.demoPrompt} Do not write any file: show the code in your answer, 25 lines at most.`;

console.log(`Squad ${cfg.number} · ${cfg.label}\n`);
console.log(`Prompt: ${cfg.demoPrompt}\n`);
console.log(`WITHOUT context:  cd "${dir}"  then  claude`);
console.log(`WITH context:     cd "${starter}"  then  claude`);
console.log(`\nWhat to look at: ${cfg.demoWatch}\n`);

if (args.includes('--run')) {
  for (const [title, cwd] of [['WITHOUT context', dir], ['WITH context', starter]]) {
    console.log(`\n===== ${title} =====\n`);
    try {
      console.log(execFileSync('claude', ['-p', prompt, '--max-turns', '10', '--output-format', 'text'], { cwd, encoding: 'utf8', timeout: 300000, stdio: ['ignore', 'pipe', 'pipe'] }).trim());
    } catch (e) {
      const out = String(e.stdout || '').trim();
      const err = String(e.stderr || e.message).split('\n').filter(Boolean).slice(0, 2).join(' · ');
      console.log(out || `(no answer: ${err})`);
    }
  }
}
