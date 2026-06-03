# Changelog

所有重要变更都会记录在此文件中。

格式基于 Keep a Changelog，版本号遵循语义化版本。

## [1.1.0] - 2026-06-03

### 新增
- playground 案例：审核详情页（底部常驻驳回/通过操作栏）
- playground 案例：创建微信拨付单（三步流程）
- `scripts/` 发布链路脚本（check-version、check-package、update-check、update、daily-update-hook）
- 组件规范：弹窗（Dialog）位置/尺寸强制规范（960×740px 上下居中、Body 独立滚动 CSS 模板）
- 组件规范：一致性检测规则完整章节（5条强制规则）
- `SKILL.md` 设计规范第14条：一致性检测

### 变更
- 包名 `tencent-charity-skill` → `tencent-charity-design-skill`
- `skill.config.cjs` 全面重构为扁平化统一配置格式，对齐 skill-release/auto-update/report 规范
- `hooks/on-session-start.cjs` 重写：新增 Skill 版本检查、playground 依赖检测、tdesign-d2c 前置检查
- `hooks.json` 新增每日 CDN 版本探测 Hook；SessionStart timeout 30s → 60s
- `disbursement-list` "新建"按钮绑定跳转至创建拨付单页
- 图片资源改用 CDN 绝对路径

### 修复
- 登录页背景图 CDN 路径错误
- 受助人详情页空态图路径（本地相对路径 → CDN 链接）

## [1.0.0] - 2026-05-30

### 新增
- 腾讯公益机构平台 B 端设计规范（视觉/交互/流程/组件）
- playground 案例：登录页、首页、微信拨付管理、创建微信拨付单、受助人详情、编辑受助人、审核详情
- 接入 skill-release：版本一致性检查、打包校验
- 接入 skill-auto-update：CDN 自动更新、每日 Hook
- 接入 skill-report：InLong 数据上报
