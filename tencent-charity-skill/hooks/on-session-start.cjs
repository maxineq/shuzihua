/**
 * 会话启动钩子
 * - 检查 Node.js / npm 版本
 * - 验证 specs/ 规范文件完整性
 * - 输出欢迎信息和可用技能列表
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function onSessionStart(context) {
  const rootDir = path.resolve(__dirname, '..');
  const errors = [];

  // 1. 检查 Node 版本
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (major < 18) {
      errors.push(`Node.js 版本过低: ${nodeVersion}，需要 ≥18`);
    }
  } catch (e) {
    errors.push('无法检测 Node.js 版本');
  }

  // 2. 检查规范目录
  const specDirs = ['visual', 'interaction', 'flow', 'components'];
  for (const dir of specDirs) {
    const specPath = path.join(rootDir, 'specs', dir);
    if (!fs.existsSync(specPath)) {
      errors.push(`规范目录缺失: specs/${dir}/`);
    }
  }

  // 3. 检查 playground 是否已安装依赖
  const nodeModules = path.join(rootDir, 'playground', 'node_modules');
  const needsInstall = !fs.existsSync(nodeModules);

  // 4. 输出结果
  if (errors.length > 0) {
    return {
      message: `⚠️ 环境检查发现问题:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      abort: errors.some(e => e.includes('Node.js')),
    };
  }

  return {
    message: [
      '✅ 腾讯公益机构平台 - 设计工作流已就绪',
      '',
      '📐 可用技能:',
      '  • 界面设计 — 输入"页面/界面/UI"关键词触发',
      '  • 交互设计 — 输入"交互/状态/动效"关键词触发',
      '  • 流程设计 — 输入"流程/流程图"关键词触发',
      '',
      needsInstall ? '⏳ 首次运行将自动安装依赖...' : '🚀 预览引擎已就绪',
    ].join('\n'),
  };
};
