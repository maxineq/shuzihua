/**
 * 会话结束钩子
 * - 校验产物完整性
 * - 记录使用指标
 */
const fs = require('fs');
const path = require('path');

module.exports = async function onStop(context) {
  const rootDir = path.resolve(__dirname, '..');
  const casesDir = path.join(rootDir, 'playground', 'src', 'cases');

  // 统计当前 cases 数量
  let caseCount = 0;
  if (fs.existsSync(casesDir)) {
    caseCount = fs.readdirSync(casesDir)
      .filter(f => fs.statSync(path.join(casesDir, f)).isDirectory())
      .length;
  }

  // 记录指标（可对接 webhook）
  const metrics = {
    platform: 'claude',
    product: '腾讯公益机构平台',
    caseCount,
    timestamp: new Date().toISOString(),
  };

  // 写入本地日志
  const logPath = path.join(rootDir, 'output', '.metrics.json');
  try {
    let logs = [];
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    logs.push(metrics);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (e) {
    // 静默失败
  }

  return { message: `📊 会话结束，当前共 ${caseCount} 个设计案例` };
};
