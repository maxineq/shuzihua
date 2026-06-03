#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function parseArgs(argv) {
  const args = { root: process.cwd(), zip: '', zipRoot: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') args.root = argv[++i];
    else if (a.startsWith('--root=')) args.root = a.slice(7);
    else if (a === '--zip') args.zip = argv[++i];
    else if (a.startsWith('--zip=')) args.zip = a.slice(6);
    else if (a === '--zip-root') args.zipRoot = argv[++i];
    else if (a.startsWith('--zip-root=')) args.zipRoot = a.slice(11);
  }
  return args;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function match(content, regex) {
  const m = content.match(regex);
  return m ? m[1].trim() : '';
}

function exists(file) {
  return fs.existsSync(file);
}

function zipRead(zip, inner) {
  return execFileSync('unzip', ['-p', zip, inner], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function zipList(zip) {
  return execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .split(/\r?\n/)
    .filter(Boolean);
}

function detectZipRoot(zip) {
  const first = zipList(zip)[0] || '';
  return first.split('/')[0];
}

function collectSource(root) {
  const result = { root: path.resolve(root), values: {}, warnings: [], errors: [] };
  const skillMd = path.join(root, 'SKILL.md');
  const pkgPath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const changelogPath = path.join(root, 'CHANGELOG.md');
  const configPath = path.join(root, 'skill.config.cjs');

  if (!exists(skillMd)) result.errors.push('missing SKILL.md');
  else {
    const s = read(skillMd);
    result.values.skillName = match(s, /^name:\s*(.+)$/m);
    result.values.skillVersion = match(s, /^version:\s*(.+)$/m);
  }

  if (!exists(pkgPath)) result.warnings.push('missing package.json');
  else {
    const j = readJson(pkgPath);
    result.values.packageName = j.name || '';
    result.values.packageVersion = j.version || '';
  }

  if (!exists(lockPath)) result.warnings.push('missing package-lock.json');
  else {
    const j = readJson(lockPath);
    result.values.lockName = j.name || '';
    result.values.lockVersion = j.version || '';
    result.values.lockRootName = j.packages && j.packages[''] ? j.packages[''].name || '' : '';
    result.values.lockRootVersion = j.packages && j.packages[''] ? j.packages[''].version || '' : '';
  }

  if (!exists(changelogPath)) result.warnings.push('missing CHANGELOG.md');
  else result.values.changelogVersion = match(read(changelogPath), /^## \[([^\]]+)\]/m);

  if (exists(configPath)) {
    const s = read(configPath);
    result.values.skillPackageName = match(s, /skillPackageName:\s*['"]([^'"]+)['"]/m);
  }

  if (exists(path.join(root, '.agents'))) result.warnings.push('local .agents directory exists; exclude it from release checks');
  return result;
}

function collectZip(zip, rootDir) {
  const root = rootDir || detectZipRoot(zip);
  const values = {};
  const errors = [];
  const warnings = [];

  function safeRead(file) {
    try { return zipRead(zip, `${root}/${file}`); }
    catch { errors.push(`zip missing ${root}/${file}`); return ''; }
  }

  const skill = safeRead('SKILL.md');
  if (skill) {
    values.zipSkillName = match(skill, /^name:\s*(.+)$/m);
    values.zipSkillVersion = match(skill, /^version:\s*(.+)$/m);
  }

  const pkg = safeRead('package.json');
  if (pkg) {
    const j = JSON.parse(pkg);
    values.zipPackageName = j.name || '';
    values.zipPackageVersion = j.version || '';
  }

  const lock = safeRead('package-lock.json');
  if (lock) {
    const j = JSON.parse(lock);
    values.zipLockName = j.name || '';
    values.zipLockVersion = j.version || '';
    values.zipLockRootName = j.packages && j.packages[''] ? j.packages[''].name || '' : '';
    values.zipLockRootVersion = j.packages && j.packages[''] ? j.packages[''].version || '' : '';
  }

  const changelog = safeRead('CHANGELOG.md');
  if (changelog) values.zipChangelogVersion = match(changelog, /^## \[([^\]]+)\]/m);

  return { zip: path.resolve(zip), zipRoot: root, values, warnings, errors };
}

function compareEqual(label, values, keys, errors) {
  const present = keys.map(k => [k, values[k]]).filter(([, v]) => v);
  if (present.length < 2) return;
  const expected = present[0][1];
  for (const [k, v] of present) {
    if (v !== expected) errors.push(`${label} mismatch: ${present.map(([a, b]) => `${a}=${b}`).join(', ')}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = collectSource(args.root);
  const allErrors = [...source.errors];
  const allWarnings = [...source.warnings];

  compareEqual('source version', source.values, ['skillVersion', 'packageVersion', 'lockVersion', 'lockRootVersion', 'changelogVersion'], allErrors);
  compareEqual('source name', source.values, ['skillName', 'packageName', 'lockName', 'lockRootName', 'skillPackageName'], allErrors);

  let zip = null;
  if (args.zip) {
    zip = collectZip(args.zip, args.zipRoot);
    allErrors.push(...zip.errors);
    allWarnings.push(...zip.warnings);
    compareEqual('zip version', zip.values, ['zipSkillVersion', 'zipPackageVersion', 'zipLockVersion', 'zipLockRootVersion', 'zipChangelogVersion'], allErrors);
    compareEqual('zip name', zip.values, ['zipSkillName', 'zipPackageName', 'zipLockName', 'zipLockRootName'], allErrors);
    if (source.values.skillVersion && zip.values.zipSkillVersion && source.values.skillVersion !== zip.values.zipSkillVersion) {
      allErrors.push(`source/zip version mismatch: source=${source.values.skillVersion}, zip=${zip.values.zipSkillVersion}`);
    }
    if (source.values.skillName && zip.values.zipSkillName && source.values.skillName !== zip.values.zipSkillName) {
      allErrors.push(`source/zip name mismatch: source=${source.values.skillName}, zip=${zip.values.zipSkillName}`);
    }
  }

  const output = { ok: allErrors.length === 0, source, zip, warnings: allWarnings, errors: allErrors };
  console.log(JSON.stringify(output, null, 2));
  process.exit(output.ok ? 0 : 1);
}

main();
