// ============================================================
// 腾讯公益机构平台 - 技能注册中心
// ============================================================

export interface PageRoute {
  pageId: string;
  displayName: string;
  fileName: string;
  routePath: string;
  keywords: string[];
  coverImageUrl?: string;
}

export interface SkillRegistration {
  skillId: string;
  displayName: string;
  description: string;
  triggerPatterns: string[];
  pages: PageRoute[];
  snippets: string[];
  assets: string[];
}

export interface Reference {
  label: string;
  url: string;
}

// ============================================================
// 业务技能
// ============================================================

export const skills: SkillRegistration[] = [
  {
    skillId: 'ui-design',
    displayName: '界面设计',
    description: '根据视觉规范和组件规范生成新界面原型',
    triggerPatterns: [
      '页面', '界面', '新建页面', '设计页面', '生成界面',
      'UI', '原型', '布局', '样式', '视觉',
      '列表页', '详情页', '表单', '弹窗', '卡片',
    ],
    pages: [],
    snippets: [],
    assets: [],
  },
  {
    skillId: 'interaction-design',
    displayName: '交互设计',
    description: '根据交互规范定义页面状态、转场、反馈机制',
    triggerPatterns: [
      '交互', '动效', '状态', '转场', '反馈',
      '点击', '滑动', '加载', '空状态', '异常态',
      '弹窗交互', '表单校验', '手势',
    ],
    pages: [],
    snippets: [],
    assets: [],
  },
  {
    skillId: 'flow-design',
    displayName: '流程设计',
    description: '根据流程规范生成功能流程图和各节点原型',
    triggerPatterns: [
      '流程', '功能流程', '业务流程', '用户流程',
      '流程图', '节点', '分支', '判断',
      '捐赠流程', '审核流程', '申请流程', '认证流程',
    ],
    pages: [],
    snippets: [],
    assets: [],
  },
];

// ============================================================
// 工具技能（非业务）
// ============================================================

export const utilitySkills: SkillRegistration[] = [
  {
    skillId: 'skill-publish',
    displayName: '发布',
    description: '将产物发布到 CDN 或交付目录',
    triggerPatterns: ['发布', '上线', 'publish', '导出'],
    pages: [],
    snippets: [],
    assets: [],
  },
  {
    skillId: 'skill-report',
    displayName: '数据上报',
    description: '上报使用指标',
    triggerPatterns: [],
    pages: [],
    snippets: [],
    assets: [],
  },
];
