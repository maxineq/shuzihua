#!/usr/bin/env node

/**
 * Skill Auto-Update — 每日自动检查更新钩子
 *
 * 功能：
 * 每日首次用户输入时，自动注入 skill-update 检查指令到 AI context，
 * 让 AI 自动执行对比脚本，检查 CDN 上是否有新版本。
 *
 * 触发时机：UserPromptSubmit（通过 hooks.json 配置）
 *
 * 配置：
 * 所有可配置项在 ../update.config.cjs 中修改
 *
 * 集成方式：
 * 在 hooks.json 的 UserPromptSubmit 事件中添加：
 * {
 *   "matcher": ".*",
 *   "hooks": [{
 *     "type": "command",
 *     "command": "node skills/skill-auto-update/scripts/daily-update-hook.cjs",
 *     "timeout": 10
 *   }]
 * }
 */

const fs = require("fs");
const path = require("path");

// ─── 读取配置 ──────────────────────────────────────────────────────────────────
const config = require("../skill.config.cjs");

// ─── 状态文件路径（兼容多种 Agent IDE）────────────────────────────────────────
const PROJECT_DIR = process.env.CODEBUDDY_PROJECT_DIR
  || process.env.WORKBUDDY_PROJECT_DIR
  || process.env.CLAUDE_PROJECT_DIR
  || process.cwd();

// 确定状态目录（优先使用当前 IDE 的目录）
function getStateDir() {
  if (process.env.WORKBUDDY_PROJECT_DIR) {
    return path.join(PROJECT_DIR, ".workbuddy");
  }
  if (process.env.CLAUDE_PROJECT_DIR) {
    return path.join(PROJECT_DIR, ".claude");
  }
  // 默认 CodeBuddy
  return path.join(PROJECT_DIR, ".codebuddy");
}

const STATE_DIR = getStateDir();
const LOCK_FILE = path.join(STATE_DIR, ".skill-update-last-run");
const UPDATE_SCRIPT = path.join(__dirname, "update.cjs");

function debug(msg) {
  if (process.env.CODEBUDDY_DEBUG === "1" || process.env.WORKBUDDY_DEBUG === "1") {
    process.stderr.write(`[skill-auto-update] ${msg}\n`);
  }
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 */
function getTodayDateStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * 检查今天是否已执行过更新检查
 */
function hasRunToday() {
  try {
    if (!fs.existsSync(LOCK_FILE)) return false;
    const lastRunDate = fs.readFileSync(LOCK_FILE, "utf8").trim();
    return lastRunDate === getTodayDateStr();
  } catch {
    return false;
  }
}

/**
 * 标记今天已执行
 */
function markDone() {
  try {
    const dir = path.dirname(LOCK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCK_FILE, getTodayDateStr(), "utf8");
    debug(`锁文件已写入: ${LOCK_FILE}`);
  } catch (err) {
    debug(`写入锁文件失败: ${err.message}`);
  }
}

/**
 * 生成更新检查指令（注入到 AI context）
 * 仅在今天尚未执行过时返回内容
 */
async function generateUpdatePrompt() {
  if (hasRunToday()) {
    debug("今日已执行更新检查，跳过");
    return "";
  }

  // 检查更新脚本是否存在
  if (!fs.existsSync(UPDATE_SCRIPT)) {
    debug(`更新脚本不存在: ${UPDATE_SCRIPT}`);
    return "";
  }

  // 提前写入锁，防止同一天多次触发
  markDone();

  const useHeadGate = config.dailyUpdateUseHeadGate !== false;
  if (useHeadGate) {
    const timeoutMs = Number(config.dailyUpdateHeadTimeoutMs || 2000);
    try {
      const checker = require("./update-check.cjs");
      const headResult = await Promise.race([
        checker.checkRemoteUpdate(PROJECT_DIR, { forceNetwork: true, config }),
        new Promise((resolve) => setTimeout(() => resolve(undefined), timeoutMs)),
      ]);

      if (headResult && headResult.hasUpdate === false) {
        debug("每日 HEAD：远端指纹未变，跳过完整 update.cjs");
        return "";
      }
      if (headResult && headResult.hasUpdate === true) {
        debug("每日 HEAD：检测到远端更新，注入完整对比");
      } else {
        debug("每日 HEAD 超时/失败，降级执行完整 update.cjs");
      }
    } catch (err) {
      debug(`update-check 失败: ${err.message}，降级完整对比`);
    }
  }

  return `
## 🔄 每日 ${config.skillName} 更新（自动触发，每天仅一次）

<system-reminder>
[skill-auto-update] 检测到今天尚未执行 ${config.skillName} 更新检查，请在处理用户请求之前，先执行以下操作：

**Step 1**: 执行对比脚本
\`\`\`bash
node ${UPDATE_SCRIPT} ${PROJECT_DIR}
\`\`\`

**Step 2**: 解析脚本输出中 \`--- JSON_OUTPUT_START ---\` 和 \`--- JSON_OUTPUT_END ---\` 之间的 JSON 数据

**Step 3**: 根据 diff 结果判断：
- 如果 added=0 且 modified=0 → 输出"✅ ${config.skillName} 已是最新版本"，然后继续处理用户的原始请求
- 如果有差异 → 展示差异摘要，询问用户选择：
  A. 全量覆盖（默认）
  B. 智能合并
  C. 取消

**Step 4**: 执行用户选择的更新操作

**Step 5**: 清理临时文件（rm -rf {tempDir的父目录}）

**重要**：更新完成后，继续处理用户的原始请求，不要让用户重新输入。
</system-reminder>
`;
}

// ─── 从 stdin 读取 Hook 输入 ──────────────────────────────────────────────────
async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    process.stdin.on("error", () => resolve({}));
    setTimeout(() => resolve({}), 3000);
  });
}

// ─── 主函数 ──────────────────────────────────────────────────────────────────
async function main() {
  try {
    await readStdin(); // 消费 stdin（Hook 协议要求）

    const updatePrompt = await generateUpdatePrompt();

    if (!updatePrompt) {
      // 今日已检查或脚本不存在，直接放行
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // 注入更新检查指令到 AI context
    const output = {
      continue: true,
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: updatePrompt,
      },
    };

    console.log(JSON.stringify(output));
  } catch (err) {
    debug(`执行出错: ${err.message}`);
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
