# 腾讯公益机构平台 - AI 设计技能

基于产品设计规范（视觉/交互/流程），AI 自动生成符合规范的新界面原型和功能流程。

## 快速开始

1. 将本项目目录作为 AI 工作区打开
2. AI 会自动读取 `SKILL.md` 作为工作指令
3. 直接描述你的需求即可，例如：
   - "帮我设计一个新的项目详情页"
   - "设计捐赠确认的交互流程"
   - "画一个机构认证的完整流程图"

## 目录结构

```
tencent-charity-design-skill/
├── SKILL.md              ← AI 主指令（核心）
├── registry.ts           ← 技能注册中心
├── specs/                ← 设计规范（你需要填充）
│   ├── visual/           ← 视觉规范（色彩/字体/间距）
│   ├── interaction/      ← 交互规范（状态/动效/反馈）
│   ├── flow/             ← 流程规范（流程模板/节点定义）
│   └── components/       ← 组件规范（组件库文档）
├── playground/           ← 实时预览引擎
├── output/               ← 最终交付物
├── hooks/                ← 事件钩子
└── skills/               ← 业务技能模板
```

## 你需要做的

### 1. 填充规范内容
将你的实际设计规范替换 `specs/` 下的模板内容：

- `specs/visual/design-tokens.md` — 替换为实际的色彩、字体、间距规范
- `specs/interaction/interaction-rules.md` — 替换为实际的交互规则
- `specs/flow/flow-rules.md` — 替换为实际的业务流程模板
- `specs/components/component-library.md` — 替换为实际的组件文档

### 2. 补充参考资料
- Figma 截图放到 `specs/` 对应子目录
- 代码片段放到 `skills/{skillId}/templates/`
- 完整页面模板放到 `skills/{skillId}/assets/pages/`

### 3. 开始使用
告诉 AI 你的设计需求，它会：
1. 自动检索相关规范
2. 输出流程图 + 设计方案
3. 生成可预览的 HTML 原型
4. 等你确认后导出最终产物
