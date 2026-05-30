/**
 * 用户提交钩子
 * - 提取关键词
 * - 匹配技能
 * - 建议相关规范
 */
module.exports = async function onUserPromptSubmit(context) {
  const { prompt } = context;
  if (!prompt) return {};

  // 简单关键词提取（实际可接入更复杂的 NLP）
  const keywords = {
    'ui-design': ['页面', '界面', 'UI', '原型', '布局', '列表', '详情', '表单', '弹窗', '卡片'],
    'interaction-design': ['交互', '动效', '状态', '转场', '反馈', '点击', '滑动', '加载', '校验'],
    'flow-design': ['流程', '流程图', '节点', '分支', '捐赠流程', '审核', '申请', '认证'],
  };

  const matched = [];
  for (const [skillId, patterns] of Object.entries(keywords)) {
    if (patterns.some(p => prompt.includes(p))) {
      matched.push(skillId);
    }
  }

  if (matched.length > 0) {
    return {
      message: `🎯 匹配技能: ${matched.join(', ')}`,
      metadata: { matchedSkills: matched },
    };
  }

  return {};
};
