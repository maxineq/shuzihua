/**
 * 会话启动钩子
 * 1. 检查 Skill 自身是否有新版本
 * 2. 检查/安装 playground 依赖（package.json）
 * 3. 验证核心脚本可正常运行
 * 4. 验证 specs/ 规范目录完整性
 * 5. tdesign-d2c 前置检查（目录存在时）
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(SKILL_DIR, '..');
const D2C_DIR = path.join(PROJECT_ROOT, 'tdesign-d2c');
const D2C_VERSION_URL = 'https://tdesign.gtimg.com/d2c/skill-version.json';

function run(cmd, cwd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: cwd || SKILL_DIR, stdio: 'pipe' }).trim();
  } catch (e) {
    return null;
  }
}

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return null; }
}

module.exports = async function onSessionStart() {
  const lines = [];
  const warnings = [];
  const errors = [];

  // ── 1. 检查 Node 版本 ──────────────────────────────────
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (major < 18) errors.push(`Node.js 版本过低: ${nodeVersion}，需要 ≥18`);
  } catch (e) {
    errors.push('无法检测 Node.js 版本');
  }

  if (errors.length > 0) {
    return {
      message: `⚠️ 环境检查发现问题:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      abort: true,
    };
  }

  // ── 2. Skill 自身版本检查 ──────────────────────────────
  const pkg = readJSON(path.join(SKILL_DIR, 'package.json'));
  const config = (() => { try { return require(path.join(SKILL_DIR, 'skill.config.cjs')); } catch (e) { return {}; } })();
  const currentVer = pkg?.version || 'unknown';
  const updateEnabled = config?.updateCheck?.enabled !== false;

  if (updateEnabled) {
    // 用 skill.config 里的 update URL，如果没有则跳过远端检查
    const updateUrl = config?.updateCheck?.url;
    if (updateUrl) {
      const timeout = config?.updateCheck?.timeoutMs || 2000;
      const raw = run(`curl -s --max-time ${Math.ceil(timeout / 1000)} ${updateUrl}`);
      if (raw) {
        try {
          const latest = JSON.parse(raw).version;
          if (latest && latest !== currentVer) {
            warnings.push(`⬆️  Skill 有新版本 ${latest}（当前 ${currentVer}）`);
          } else {
            lines.push(`✅ Skill 版本 ${currentVer}（已是最新）`);
          }
        } catch (e) {
          lines.push(`ℹ️  Skill 版本 ${currentVer}（无法解析版本响应）`);
        }
      } else {
        lines.push(`ℹ️  Skill 版本 ${currentVer}（版本检查跳过）`);
      }
    } else {
      lines.push(`✅ Skill 版本 ${currentVer}`);
    }
  }

  // ── 3. 检查/安装 playground 依赖 ──────────────────────
  const playgroundDir = path.join(SKILL_DIR, 'playground');
  const playgroundPkg = path.join(playgroundDir, 'package.json');
  const playgroundModules = path.join(playgroundDir, 'node_modules');

  if (fs.existsSync(playgroundPkg)) {
    if (!fs.existsSync(playgroundModules)) {
      lines.push('📦 playground 依赖未安装，正在安装...');
      const result = run('npm install', playgroundDir);
      if (result !== null) {
        lines.push('✅ playground 依赖安装完成');
      } else {
        warnings.push('❌ playground 依赖安装失败，请手动执行：cd playground && npm install');
      }
    } else {
      lines.push('✅ playground 依赖已就绪');
    }
  }

  // ── 4. 验证核心脚本可运行 ─────────────────────────────
  const scripts = config?.scripts || {};
  // 检查 package.json scripts 中的 preflight 脚本是否存在对应文件
  const preflightScript = path.join(SKILL_DIR, 'scripts', 'preflight.mjs');
  if (fs.existsSync(preflightScript)) {
    const nodeOk = run('node --version') !== null;
    lines.push(nodeOk
      ? '✅ 核心脚本运行环境就绪'
      : '⚠️  node 不可用，核心脚本无法运行');
  }

  // ── 5. 验证 specs/ 规范目录完整性 ─────────────────────
  const specDirs = ['visual', 'interaction', 'flow', 'components'];
  const missingSpecs = specDirs.filter(d => !fs.existsSync(path.join(SKILL_DIR, 'specs', d)));
  if (missingSpecs.length > 0) {
    warnings.push(`规范目录缺失: ${missingSpecs.map(d => `specs/${d}/`).join(', ')}`);
  }

  // ── 6. tdesign-d2c 前置检查（目录存在时）──────────────
  const d2cLines = [];
  if (fs.existsSync(D2C_DIR)) {
    d2cLines.push('', '─── tdesign-d2c 前置检查 ───');

    // 版本检测
    const preflightPath = path.join(D2C_DIR, 'PREFLIGHT_CHECK.md');
    const preflight = fs.existsSync(preflightPath) ? fs.readFileSync(preflightPath, 'utf8') : '';
    const localVer = (preflight.match(/skill version:\s*([\d.]+)/) || [])[1];
    const raw = run(`curl -s --max-time 5 ${D2C_VERSION_URL}`);
    if (raw) {
      try {
        const latestVer = JSON.parse(raw).version;
        if (localVer && latestVer !== localVer) {
          d2cLines.push(`  ⬆️  有新版本 ${latestVer}（当前 ${localVer}），下载：https://tdesign.gtimg.com/d2c/tdesign-d2c.zip`);
        } else {
          d2cLines.push(`  ✅ 版本 ${localVer || latestVer}（已是最新）`);
        }
      } catch (e) { d2cLines.push('  ℹ️  版本检查跳过'); }
    } else {
      d2cLines.push(`  ℹ️  版本检查跳过（网络不可达）`);
    }

    // 依赖检查
    const utilsPkg = path.join(PROJECT_ROOT, 'node_modules', '@tdesign', 'd2c-utils', 'package.json');
    let utilsVer = readJSON(utilsPkg)?.version || null;
    if (!utilsVer) {
      d2cLines.push('  📦 @tdesign/d2c-utils 未安装，正在安装...');
      run('npm install -D @tdesign/d2c-utils@latest', PROJECT_ROOT);
      utilsVer = readJSON(utilsPkg)?.version || null;
      d2cLines.push(utilsVer ? `  ✅ @tdesign/d2c-utils@${utilsVer} 安装完成` : '  ❌ 安装失败，请手动执行：npm install -D @tdesign/d2c-utils@latest');
    } else {
      const outdated = run('npm outdated @tdesign/d2c-utils', PROJECT_ROOT);
      if (outdated) {
        run('npm install -D @tdesign/d2c-utils@latest', PROJECT_ROOT);
        utilsVer = readJSON(utilsPkg)?.version || utilsVer;
        d2cLines.push(`  ✅ @tdesign/d2c-utils 已更新至 ${utilsVer}`);
      } else {
        d2cLines.push(`  ✅ @tdesign/d2c-utils@${utilsVer}（已是最新）`);
      }
    }

    // 脚本验证
    const indexTs = path.join(D2C_DIR, 'scripts', 'index.ts');
    if (!fs.existsSync(indexTs)) {
      d2cLines.push('  ❌ scripts/index.ts 缺失，Skill 文件可能不完整');
    } else {
      const tsxVer = run('npx tsx --version 2>&1');
      d2cLines.push(tsxVer ? `  ✅ 脚本运行环境就绪（tsx ${tsxVer.split('\n')[0]}）` : '  ⚠️  npx tsx 不可用，首次使用会自动安装');
    }

    // Figma Token
    const token = (preflight.match(/figma-token:\s*([^\s\n]+)/) || [])[1];
    if (!token || token === '<your-token>') {
      d2cLines.push('  ⚠️  Figma Token 未配置，请在 tdesign-d2c/PREFLIGHT_CHECK.md 中填写');
    } else {
      d2cLines.push(`  ✅ Figma Token 已配置（${token.slice(0, 8)}...）`);
    }
  }

  // ── 输出汇总 ────────────────────────────────────────────
  return {
    message: [
      '✅ 腾讯公益机构平台 - 设计工作流已就绪',
      '',
      '📐 可用技能:',
      '  • 界面设计 — 输入"页面/界面/UI"关键词触发',
      '  • 交互设计 — 输入"交互/状态/动效"关键词触发',
      '  • 流程设计 — 输入"流程/流程图"关键词触发',
      '',
      ...lines,
      ...(warnings.length > 0 ? ['', '⚠️  需要关注:', ...warnings.map(w => `  ${w}`)] : []),
      ...d2cLines,
    ].join('\n'),
  };
};


