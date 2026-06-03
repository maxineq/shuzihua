import { lazy, ComponentType } from 'react';

// ============================================================
// Case 注册表
// AI 生成新案例时会自动在此注册
// ============================================================

export interface CaseRegistration {
  caseId: string;
  displayName: string;
  description: string;
  type: 'ui' | 'interaction' | 'flow' | 'full';
  component: ComponentType;
  createdAt: string;
}

export const cases: CaseRegistration[] = [
  {
    caseId: 'login',
    displayName: '登录页',
    description: '管理端登录页 - 毛玻璃卡片 + 短信/微信/QQ/企业微信登录',
    type: 'ui',
    component: lazy(() => import('./login/Page')),
    createdAt: '2026-05-27',
  },
  {
    caseId: 'disbursement-list',
    displayName: '微信拨付管理',
    description: '拨付单列表页 - Tab筛选、数据表格、状态圆点、操作链接、分页',
    type: 'ui',
    component: lazy(() => import('./disbursement-list/Page')),
    createdAt: '2026-05-27',
  },
  {
    caseId: 'disbursement-create',
    displayName: '创建微信拨付单',
    description: '微信拨付单三步流程 - 选择批次、填写信息、确认提交',
    type: 'flow',
    component: lazy(() => import('./disbursement-create/Page')),
    createdAt: '2026-05-30',
  },
  {
    caseId: 'dashboard',
    displayName: '首页',
    description: 'Dashboard首页 - 数据概览、常用功能、待办事项、排行榜',
    type: 'ui',
    component: lazy(() => import('./dashboard/Page')),
    createdAt: '2026-05-27',
  },
  {
    caseId: 'beneficiary-detail',
    displayName: '受助人详情',
    description: '受助人详情页 - 信息分组、家访记录空态、附件材料、审核记录',
    type: 'ui',
    component: lazy(() => import('./beneficiary-detail/Page')),
    createdAt: '2026-05-30',
  },
  {
    caseId: 'audit-detail',
    displayName: '审核详情',
    description: '审核详情页 - 受助人信息 + 底部常驻驳回/通过操作栏',
    type: 'ui',
    component: lazy(() => import('./audit-detail/Page')),
    createdAt: '2026-05-30',
  },
  {
    caseId: 'beneficiary-edit',
    displayName: '编辑受助人',
    description: '受助人编辑页 - 按 Figma 表单排版组织当前详情字段',
    type: 'ui',
    component: lazy(() => import('./beneficiary-edit/Page')),
    createdAt: '2026-05-30',
  },
];
