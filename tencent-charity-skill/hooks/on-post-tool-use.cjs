/**
 * 工具执行后钩子
 * - 验证生成文件完整性
 * - 检查规范一致性
 */
module.exports = async function onPostToolUse(context) {
  // 如果是文件写入操作，检查是否包含规范引用注释
  const { toolName, result } = context;

  if (toolName === 'Write' && result && result.filePath) {
    const filePath = result.filePath;
    // 仅检查 cases/ 目录下的 HTML 文件
    if (filePath.includes('/cases/') && filePath.endsWith('.html')) {
      // 提醒检查规范引用
      return {
        message: '💡 提示: 请确认生成的 HTML 中包含 @spec 规范引用注释',
      };
    }
  }

  return {};
};
