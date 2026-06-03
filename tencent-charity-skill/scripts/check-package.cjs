#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

function parseArgs(argv) {
  const args = { zip: '', rootDir: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--zip') args.zip = argv[++i];
    else if (a.startsWith('--zip=')) args.zip = a.slice(6);
    else if (a === '--root-dir') args.rootDir = argv[++i];
    else if (a.startsWith('--root-dir=')) args.rootDir = a.slice(11);
  }
  return args;
}

function zipRead(zip, inner) {
  return execFileSync('unzip', ['-p', zip, inner], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function zipList(zip) {
  return execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .split(/\r?\n/)
    .filter(Boolean);
}

function detectRoot(zip) {
  const first = zipList(zip)[0] || '';
  return first.split('/')[0];
}

function match(content, regex) {
  const m = content.match(regex);
  return m ? m[1].trim() : '';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.zip) {
    console.error('Usage: node scripts/check-package.cjs --zip <file.zip> [--root-dir <zip-root>]');
    process.exit(2);
  }

  const zip = path.resolve(args.zip);
  const root = args.rootDir || detectRoot(zip);
  const errors = [];
  const values = { zip, root };

  function readRequired(file) {
    try { return zipRead(zip, `${root}/${file}`); }
    catch { errors.push(`missing ${root}/${file}`); return ''; }
  }

  const skill = readRequired('SKILL.md');
  if (skill) {
    values.skillName = match(skill, /^name:\s*(.+)$/m);
    values.skillVersion = match(skill, /^version:\s*(.+)$/m);
  }

  const pkgText = readRequired('package.json');
  if (pkgText) {
    const pkg = JSON.parse(pkgText);
    values.packageName = pkg.name || '';
    values.packageVersion = pkg.version || '';
  }

  const lockText = readRequired('package-lock.json');
  if (lockText) {
    const lock = JSON.parse(lockText);
    values.lockName = lock.name || '';
    values.lockVersion = lock.version || '';
    values.lockRootName = lock.packages && lock.packages[''] ? lock.packages[''].name || '' : '';
    values.lockRootVersion = lock.packages && lock.packages[''] ? lock.packages[''].version || '' : '';
  }

  const changelog = readRequired('CHANGELOG.md');
  if (changelog) values.changelogVersion = match(changelog, /^## \[([^\]]+)\]/m);

  const versions = ['skillVersion', 'packageVersion', 'lockVersion', 'lockRootVersion', 'changelogVersion']
    .map(k => [k, values[k]])
    .filter(([, v]) => v);
  const names = ['skillName', 'packageName', 'lockName', 'lockRootName']
    .map(k => [k, values[k]])
    .filter(([, v]) => v);

  for (const group of [versions, names]) {
    if (group.length < 2) continue;
    const expected = group[0][1];
    for (const [, v] of group) {
      if (v !== expected) errors.push(`mismatch: ${group.map(([a, b]) => `${a}=${b}`).join(', ')}`);
    }
  }

  const output = { ok: errors.length === 0, values, errors };
  console.log(JSON.stringify(output, null, 2));
  process.exit(output.ok ? 0 : 1);
}

main();
