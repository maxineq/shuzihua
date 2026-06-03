#!/usr/bin/env node

/**
 * Skill Auto-Update — 更新脚本
 *
 * 功能：从 COS/CDN 下载最新 Skill zip，解压后与本地目录全量对比差异
 *
 * 用法：
 *   node update.cjs <workspace>
 *
 * 配置：
 *   所有可配置项在 ../update.config.cjs 中修改
 *
 * 输出格式：
 *   在 --- JSON_OUTPUT_START --- 和 --- JSON_OUTPUT_END --- 之间输出 JSON
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// ========== 配置（从 update.config.cjs 读取） ==========

const config = require('../skill.config.cjs');

const CDN_URL = config.cdnUrl;
const TEMP_DIR = path.join(require('os').tmpdir(), config.tempDirName);
const ZIP_FILE = path.join(TEMP_DIR, config.zipFileName);
const CDN_ROOT_DIR = config.cdnRootDir;
const LOCAL_TARGET_DIR = config.localTargetDir;

// ========== Agent IDE 检测 ==========

/**
 * 已知 Agent IDE 配置目录映射
 * 每个 IDE 有不同的配置目录名，用于存放 rules / hooks / skills 等
 */
const AGENT_IDE_MAP = [
  { id: 'codebuddy', dir: '.codebuddy', envKey: 'CODEBUDDY_PROJECT_DIR' },
  { id: 'workbuddy', dir: '.workbuddy', envKey: 'WORKBUDDY_PROJECT_DIR' },
  { id: 'claude',    dir: '.claude',    envKey: 'CLAUDE_PROJECT_DIR' },
  { id: 'cursor',    dir: '.cursor',    envKey: null },
  { id: 'windsurf',  dir: '.windsurf',  envKey: null },
];

/**
 * 检测当前正在运行的 Agent IDE
 * 优先通过环境变量判断，其次通过 workspace 中已有的配置目录判断
 * @returns {{ id: string, dir: string } | null}
 */
function detectAgentIDE(workspace) {
  // 1. 优先通过环境变量检测（精确）
  for (const agent of AGENT_IDE_MAP) {
    if (agent.envKey && process.env[agent.envKey]) {
      return { id: agent.id, dir: agent.dir };
    }
  }

  // 2. 回退：检查 workspace 中已存在的 IDE 配置目录
  for (const agent of AGENT_IDE_MAP) {
    const agentDir = path.join(workspace, agent.dir);
    if (fs.existsSync(agentDir) && fs.statSync(agentDir).isDirectory()) {
      return { id: agent.id, dir: agent.dir };
    }
  }

  return null;
}

// ========== 工具函数 ==========

function getWorkspaceRoot() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  if (args[0]) return path.resolve(args[0]);

  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    if (
      fs.existsSync(path.join(currentDir, 'package.json')) ||
      fs.existsSync(path.join(currentDir, '.git'))
    ) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return process.cwd();
}

const WORKSPACE = getWorkspaceRoot();

/**
 * 下载文件（支持 HTTP/HTTPS，支持 301/302 重定向）
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          downloadFile(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`下载失败: HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', err => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

/**
 * 解压 zip 文件
 */
function unzipFile(zipPath, destDir) {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('解压失败:', error.message);
    return false;
  }
}

/**
 * 计算文件 MD5
 */
function getFileMD5(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

/**
 * 获取两个文件的 diff
 */
function getFileDiff(localPath, cdnPath) {
  try {
    const result = execSync(`diff -u "${localPath}" "${cdnPath}" 2>/dev/null || true`, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
    });
    if (!result.trim()) return { addedLines: 0, removedLines: 0, diffContent: '' };

    let addedLines = 0;
    let removedLines = 0;
    for (const line of result.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) addedLines++;
      else if (line.startsWith('-') && !line.startsWith('---')) removedLines++;
    }

    return { addedLines, removedLines, diffContent: result.slice(0, 500) };
  } catch {
    return { addedLines: 0, removedLines: 0, diffContent: 'diff 执行失败' };
  }
}

/**
 * 递归获取目录下所有文件（相对路径）
 */
function getAllFiles(dir, baseDir) {
  baseDir = baseDir || dir;
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

/**
 * 全量对比 CDN 包和本地目录
 * @returns {{ added: Array, modified: Array, removed: Array, unchanged: Array }}
 */
function compareAll(cdnDir, localDir) {
  const cdnFiles = getAllFiles(cdnDir);
  const localFiles = getAllFiles(localDir);
  const cdnSet = new Set(cdnFiles);
  const localSet = new Set(localFiles);

  const result = { added: [], modified: [], removed: [], unchanged: [] };

  for (const file of cdnFiles) {
    const cdnPath = path.join(cdnDir, file);
    const localPath = path.join(localDir, file);
    const targetPath = path.join(WORKSPACE, LOCAL_TARGET_DIR, file);

    if (!localSet.has(file)) {
      result.added.push({ file: path.join(LOCAL_TARGET_DIR, file), cdnPath, targetPath });
    } else {
      const cdnMD5 = getFileMD5(cdnPath);
      const localMD5 = getFileMD5(localPath);

      if (cdnMD5 !== localMD5) {
        const diffInfo = getFileDiff(localPath, cdnPath);
        result.modified.push({
          file: path.join(LOCAL_TARGET_DIR, file),
          cdnPath,
          localPath,
          targetPath,
          addedLines: diffInfo.addedLines,
          removedLines: diffInfo.removedLines,
          diffContent: diffInfo.diffContent,
        });
      } else {
        result.unchanged.push(path.join(LOCAL_TARGET_DIR, file));
      }
    }
  }

  for (const file of localFiles) {
    if (!cdnSet.has(file)) {
      result.removed.push({
        file: path.join(LOCAL_TARGET_DIR, file),
        localPath: path.join(localDir, file),
      });
    }
  }

  return result;
}

// ========== 主流程 ==========

async function main() {
  console.log(`📦 开始更新 ${config.skillName}...\n`);

  // 1. 创建临时目录
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  // 2. 下载 zip
  console.log('📥 正在从 COS/CDN 下载...');
  try {
    await downloadFile(CDN_URL, ZIP_FILE);
    console.log('✅ 下载完成\n');
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    process.exit(1);
  }

  // 3. 解压
  console.log('📂 正在解压...');
  const extractDir = path.join(TEMP_DIR, 'extracted');
  if (!unzipFile(ZIP_FILE, extractDir)) {
    process.exit(1);
  }
  console.log('✅ 解压完成\n');

  // 4. 全量对比差异
  console.log('🔍 正在对比差异...\n');
  const cdnRootDir = path.join(extractDir, CDN_ROOT_DIR);
  const localRootDir = path.join(WORKSPACE, LOCAL_TARGET_DIR);

  if (!fs.existsSync(cdnRootDir)) {
    console.error(`❌ 包结构异常，未找到 ${CDN_ROOT_DIR} 目录`);
    process.exit(1);
  }

  const allDiffs = compareAll(cdnRootDir, localRootDir);

  // 5. 检测当前 Agent IDE
  const agentIDE = detectAgentIDE(WORKSPACE);
  if (agentIDE) {
    console.log(`🔗 检测到 Agent IDE: ${agentIDE.id} (${agentIDE.dir})\n`);
  } else {
    console.log('⚠️  未检测到已知 Agent IDE 配置目录\n');
  }

  // 6. 输出结果
  const output = {
    tempDir: extractDir,
    cdnRootDir,
    workspace: WORKSPACE,
    localTargetDir: LOCAL_TARGET_DIR,
    agentIDE: agentIDE,
    diff: allDiffs,
    summary: {
      added: allDiffs.added.length,
      modified: allDiffs.modified.length,
      removed: allDiffs.removed.length,
      unchanged: allDiffs.unchanged.length,
    },
  };

  console.log('📊 差异分析结果:\n');

  if (allDiffs.added.length > 0) {
    console.log(`🆕 新增文件 (${allDiffs.added.length}):`);
    allDiffs.added.forEach(item => console.log(`   - ${item.file}`));
    console.log();
  }

  if (allDiffs.modified.length > 0) {
    console.log(`✏️  修改文件 (${allDiffs.modified.length}):`);
    allDiffs.modified.forEach(item => {
      console.log(`   - ${item.file}`);
      console.log(`     +${item.addedLines} 行 / -${item.removedLines} 行`);
    });
    console.log();
  }

  if (allDiffs.removed.length > 0) {
    console.log(`📁 本地多余文件 (${allDiffs.removed.length}):`);
    allDiffs.removed.forEach(item => console.log(`   - ${item.file}`));
    console.log();
  }

  if (allDiffs.added.length === 0 && allDiffs.modified.length === 0) {
    console.log(`✅ 本地 ${config.skillName} 已是最新版本，无需更新\n`);
  }

  // 输出 JSON（供 AI 解析）
  console.log('\n--- JSON_OUTPUT_START ---');
  console.log(JSON.stringify(output, null, 2));
  console.log('--- JSON_OUTPUT_END ---');

  console.log(`\n💡 临时目录: ${extractDir}`);
  console.log('   合并完成后请由 AI 清理');
}

// ========== 入口 ==========

main().catch(err => {
  console.error(`\n❌ 更新失败: ${err.message}`);
  process.exit(1);
});
