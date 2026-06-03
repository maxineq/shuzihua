/**
 * 腾讯公益机构平台 - 全局配置
 * 同时作为 skill-release / skill-auto-update / skill-report 的统一配置入口
 */
module.exports = {
  // ── Skill 基本信息 ────────────────────────────────────────
  skillName: 'tencent-charity-design-skill',

  /** 用户侧更新主口令；空字符串默认使用 `更新 ${skillName}` */
  updateCommand: '更新 tencent-charity-design-skill',

  /** 更新口令别名，用于企业微信通知和每日更新提示 */
  updateCommandAliases: ['同步 tencent-charity-design-skill', '升级 tencent-charity-design-skill'],

  /** CDN 上的 zip 包名（不含 .zip 后缀），同时作为 zip 内根目录名 */
  skillPackageName: 'tencent-charity-design-skill',

  // ── CDN / 下载配置 ────────────────────────────────────────
  cdnDomain: 'ssv-design.ssv.tencent.com',
  cdnProtocol: 'https',
  cdnPathPrefix: 'ai_afford',

  /** 本地目标目录（用户项目中存放 skill 文件的目录名） */
  localTargetDir: '.agents',

  // ── 自动更新检查（SessionStart 轻量 HEAD 探测） ───────────
  updateCheckIntervalDays: 7,
  updateCheckTimeoutMs: 2000,
  updateCheckFailBackoffHours: 24,
  dailyUpdateUseHeadGate: true,
  dailyUpdateHeadTimeoutMs: 2000,
  dailyUpdateHeadIntervalDays: 1,

  // ── 企业微信通知 ──────────────────────────────────────────
  /** false 时明确跳过通知 */
  enableWecomNotify: false,
  /** 企业微信机器人 key；可用 .env 的 WECOM_WEBHOOK_KEY */
  wecomWebhookKey: '',
  wecomNotifyTitle: '',
  wecomNotifyUpdateGuide: '',

  // ── 数据上报 ──────────────────────────────────────────────
  enableReporting: true,
  reportSkillName: 'tencent-charity-design-skill',

  // ── 预览引擎 ──────────────────────────────────────────────
  playground: {
    port: 5173,
    viewportDesktop: 1440,
  },

  // ── 导出配置 ──────────────────────────────────────────────
  export: {
    inlineCSS: true,
    inlineJS: true,
    minify: false,
    includeMermaid: true,
    includeDesignDoc: true,
  },

  // ── 规范目录 ──────────────────────────────────────────────
  specs: {
    visual: 'specs/visual/',
    interaction: 'specs/interaction/',
    flow: 'specs/flow/',
    components: 'specs/components/',
  },

  // ── 计算属性（不要手动修改） ──────────────────────────────
  get cdnBaseUrl() {
    return `${this.cdnProtocol}://${this.cdnDomain}/${this.cdnPathPrefix}/${this.skillPackageName}.zip`;
  },
  get cdnUrl() {
    return `${this.cdnBaseUrl}?v=${Date.now()}`;
  },
  get tempDirName() {
    return `${this.skillPackageName}-update`;
  },
  get zipFileName() {
    return `${this.skillPackageName}.zip`;
  },
  get cdnRootDir() {
    return this.skillPackageName;
  },
};
