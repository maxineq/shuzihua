/**
 * 腾讯公益机构平台 - 全局配置
 */
module.exports = {
  // 包信息
  package: {
    name: 'tencent-charity-skill',
    version: '1.0.0',
    product: '腾讯公益机构平台',
  },

  // CDN 配置（资源托管）
  cdn: {
    domain: 'cdn.example.com',
    protocol: 'https',
    pathPrefix: 'assets/tencent-charity',
  },

  // 通知 Webhook（企业微信）
  webhook: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send',
    key: 'your-webhook-key',
  },

  // 自动更新检查
  updateCheck: {
    enabled: true,
    intervalDays: 7,
    timeoutMs: 1500,
    backoffHours: 24,
  },

  // 预览引擎配置
  playground: {
    port: 5173,
    viewportWidth: 375,   // 移动端视口（公益平台以移动端为主）
    viewportDesktop: 1440, // 桌面端视口
  },

  // 导出配置
  export: {
    inlineCSS: true,
    inlineJS: true,
    minify: false,
    includeMermaid: true,   // 流程图渲染支持
    includeDesignDoc: true, // 默认生成设计说明文档
  },

  // 规范目录配置
  specs: {
    visual: 'specs/visual/',
    interaction: 'specs/interaction/',
    flow: 'specs/flow/',
    components: 'specs/components/',
  },
};
