# Design System of 腾讯公益机构平台

## 1. Visual Theme & Atmosphere

腾讯公益机构平台是一个面向公益机构的 B 端管理后台，整体设计语言是**扁平、高信息密度、功能导向**的企业级产品。设计以纯白画布为基底，品牌红（`#ED3142`）作为唯一品牌色贯穿全局——用于顶部导航栏背景、主按钮、选中态和强调信息。整体视觉克制、专业，通过背景色和边框区分层次而非阴影。

字体使用 PingFang SC（苹方），以 14px Regular 为基准正文，仅在标题和强调场景使用 Semibold(600)。文字色采用黑色不同透明度（90%/60%/40%）形成三级层级，不引入额外灰阶色值。

整体布局为经典的 1440px 桌面端三栏结构：红色顶部导航(64px) + 白色左侧菜单(232px) + 灰底内容区(1208px)。组件以表格为主要信息承载方式，辅以表单、卡片、弹窗和抽屉等标准 B 端模式。

**Key Characteristics:**
- 纯白画布 + 品牌红 `#ED3142` 作为唯一品牌色
- PingFang SC 字体，14px 为基准，Semibold(600) 用于强调
- 黑色透明度三级文字：90% / 60% / 40%
- 扁平无阴影设计，层次靠背景色(#F3F3F3)和边框(#E7E7E7)区分
- 1440px 画幅，232px 固定左侧导航
- 高信息密度表格为核心信息载体
- 4px 标准圆角，极简圆角体系
- 链接/可操作文字统一使用蓝色 `#0052D9`

## 2. Color Palette & Roles

### Brand 品牌色
- **Brand Red** (`#ED3142`): 主按钮、顶部导航背景、选中Tab下划线、选中菜单文字、强调标签、分页器当前页
- **Brand Red Light** (`#FEF0F0`): 浅红背景——警告区块、选中菜单项背景、hover行、标签背景
- **Brand Red Disabled** (`#ED3142` at 40% opacity): 按钮禁用态

### Functional 功能色
- **Success Green** (`#00A870`): 成功状态、已达标、"当前生效"标签
- **Link Blue** (`#0052D9`): 所有链接文字、可点击操作、focus边框
- **Warning Orange** (`#FF9C00`): 预警图标、橙色状态标签
- **Error Red** (`#ED3142`): 错误提示、必填星号、驳回文字、未达标

### Text 文字色
- **Primary** (`rgba(0,0,0,0.9)`): 主文本、标题、数据值
- **Secondary** (`rgba(0,0,0,0.6)`): 次级文本、说明、标签、面包屑
- **Placeholder** (`rgba(0,0,0,0.4)`): 占位符、禁用文本、分组名称、版权
- **White** (`rgba(255,255,255,0.9)`): 红色/深色背景上的文字
- **Link** (`#0052D9`): 链接、操作文字

### Neutral 中性色
- **White** (`#FFFFFF`): 卡片背景、内容区背景、弹窗背景
- **Gray-1** (`#F3F3F3`): 页面底色、表头背景、折叠面板触发行
- **Gray-3** (`#E7E7E7`): 分割线、表格行边框、模块边框
- **Gray-4** (`#DCDCDC`): 输入框边框、按钮边框、外描边
- **Overlay** (`rgba(0,0,0,0.4-0.6)`): 弹窗/抽屉遮罩层

## 3. Typography Rules

### Font Family
- **Primary**: `"PingFang SC", -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif`

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Page Title | 20px | Semibold (600) | 28px | 0 | 页面大标题、项目名 |
| Module Title | 16px | Semibold (600) | 24px | 0 | 模块标题、卡片标题、弹窗标题 |
| Sub Title | 16px | Regular (400) | 24px | 0 | 子模块标题 |
| Body Bold | 14px | Semibold (600) | 22px | 0 | 表头、强调正文、Tab选中 |
| Body Regular | 14px | Regular (400) | 22px | 0 | 正文、表格数据、表单值 |
| Caption | 12px | Regular (400) | 20px | 0 | 说明文字、时间戳、标签、错误提示 |
| Large Number | 28-48px | Bold (700) | — | 0 | Dashboard大数字、金额展示 |

### Principles
- **克制的字重范围**: 仅使用 Regular(400) 和 Semibold(600)，不使用 Light/Bold
- **14px 为基准**: 90% 的界面文字为 14px，确保信息密度和可读性平衡
- **无字间距调整**: 所有文字 letter-spacing 为 0
- **颜色区分层级**: 通过黑色透明度(90%/60%/40%)而非字号变化区分信息优先级
- **数字字体**: 大数字展示（Dashboard、金额）使用 Bold(700) + 品牌红色

## 4. Component Stylings

### Buttons

**Primary (主按钮)**
- Background: `#ED3142`
- Text: `#FFFFFF`
- Height: 32px (标准) / 40px (大)
- Padding: 8px 24px
- Radius: 4px
- Disabled: 40% opacity

**Secondary (次按钮)**
- Background: `#FFFFFF`
- Text: `#ED3142`
- Border: 1px solid `#ED3142`
- Radius: 4px

**Default (默认按钮)**
- Background: `#FFFFFF`
- Text: `rgba(0,0,0,0.9)`
- Border: 1px solid `#DCDCDC`
- Radius: 4px

**Text (文字按钮/链接)**
- Background: transparent
- Text: `#0052D9`
- No border

**Dashed (虚线添加按钮)**
- Background: `#FFFFFF`
- Text: `rgba(0,0,0,0.6)`
- Border: 1px dashed `#DCDCDC`
- Prefix: "+"
- Radius: 4px

### Table 表格
- Header background: `#F3F3F3`
- Header text: 14px Semibold
- Row height: 48px (单行) / 64px (双行)
- Row border: 1px solid `#E7E7E7` (bottom)
- Cell padding: 8px 12px
- Hover row: `#F3F3F3`
- Operation links: `#0052D9`, 间距 12px

### Form 表单
- Layout: 左标签(100-140px) + 右输入区
- Label: 14px Regular, `rgba(0,0,0,0.6)` or `rgba(0,0,0,0.9)`
- Required mark: 红色 `*`, `#ED3142`, 标签左侧
- Input height: 32px / 40px
- Input border: 1px solid `#DCDCDC`
- Input radius: 4px
- Input padding: 8px 12px
- Focus border: `#0052D9`
- Error border: `#ED3142`
- Error text: 12px `#ED3142`, 输入框下方
- Help text: 12px `rgba(0,0,0,0.4)`, 输入框上方或下方
- Textarea: 最小 120px 高, 右下角字数统计(12px)
- Vertical spacing: 24px between fields

### Tab 标签页
- Font: 14px Regular
- Default: `rgba(0,0,0,0.6)`
- Active: `#ED3142` + 底部 2px solid `#ED3142`
- Tab spacing: 24-32px
- Bottom border: 1px solid `#E7E7E7`

### Dialog 弹窗
- Width: 320px (确认) / 480px (中) / 640px (中大) / 960px (大)
- Background: `#FFFFFF`
- Radius: 8px
- Overlay: `rgba(0,0,0,0.6)`
- Title: 16px Semibold
- Close: × icon, 右上角
- Footer buttons: 右对齐, 间距 12px

### Drawer 抽屉
- Width: ~50% viewport (560-720px)
- Direction: 右侧滑入
- Background: `#FFFFFF`
- Overlay: `rgba(0,0,0,0.4)` 左侧

### Dropdown 下拉菜单
- Width: 140-180px
- Background: `#FFFFFF`
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Radius: 4px
- Item height: 32px
- Hover: `#F3F3F3`
- Danger item: `#ED3142`

### Tag 标签
- Active/Selected: `#ED3142` bg + `#FFFFFF` text
- Default: `#FFFFFF` bg + 1px `#DCDCDC` border
- Warning: `#FFF3E0` bg + `#FF9C00` text + 1px `#FF9C00` border
- Error: `#FEF0F0` bg + `#ED3142` text
- Success: `#E8F8EF` bg + `#00A870` text
- Size: padding 2px 8px, 12px font, 4px radius

### Pagination 分页器
- Current: `#ED3142` bg + `#FFFFFF` text
- Default: `rgba(0,0,0,0.9)` text
- Size: 28px × 28px
- Radius: 4px
- "共 X 项数据" + "10 条/页" 选择器

### Status Dot 状态圆点
- Size: 6px circle
- Green (`#00A870`): 已通过/成功
- Red (`#ED3142`): 已驳回/错误
- Gray (`#DCDCDC`): 待审核/草稿
- Spacing to text: 8px

### Steps 步骤指示器
- Completed: 绿色 ✓ 或 红色圆 + 白字
- Current: `#ED3142` bg circle + white number
- Pending: `#DCDCDC` border circle + gray number
- Connector (done): `#ED3142`, 2px
- Connector (pending): `#E7E7E7`, 2px
- Step label: 14px, current is red, others gray

### Progress Ring 进度环
- Size: 112px × 112px
- Done arc: `#ED3142`
- Remaining arc: `#E7E7E7`
- Center text: 20px Bold, percentage

### Badge 徽标
- Background: `#ED3142`
- Text: `#FFFFFF`, 12px
- Shape: 20px circle (1-2 digits), pill (3+ digits)

### Collapse 折叠面板
- Trigger height: 44px
- Trigger bg: `#F3F3F3`
- Trigger padding: 16px
- Icon: chevron-up/down, 16px, 右侧
- Content bg: `#FFFFFF`
- Border: 1px solid `#E7E7E7`

### Tooltip / Popover
- Background: `#FFFFFF`
- Shadow: `0 2px 8px rgba(0,0,0,0.12)`
- Radius: 4px
- Arrow: 底部小三角

### User Avatar
- Small: 32px circle
- Medium: 56px circle
- Large: 64px circle
- No border

## 5. Layout Principles

### Structure
```
┌──────────────────────────────────────────────────┐
│ Header: 1440px × 64px, bg: #ED3142               │
├─────────┬────────────────────────────────────────┤
│ Sidebar │ Content Area                            │
│ 232px   │ 1208px (padding: 24px → 1160px usable) │
│ bg:#FFF │ bg: #F3F3F3                             │
└─────────┴────────────────────────────────────────┘
```

### Spacing System
| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | 图标与文字、紧凑间距 |
| sm | 8px | 元素内间距、按钮组间距 |
| md | 12px | 标签间距、小模块 |
| lg | 16px | 模块内间距、行间距、Tab与内容 |
| xl | 24px | 内容区边距、卡片内边距、模块间 |
| xxl | 32px | 大模块间隔、信息分组间 |

### Border Radius Scale
| Value | Use |
|-------|-----|
| 4px | 按钮、输入框、标签、下拉面板 |
| 8px | 卡片、弹窗、模块容器 |
| 999px | 胶囊按钮（极少使用） |
| 50% | 头像、进度环 |

### Grid
- Desktop standard: 1440px
- Sidebar: fixed 232px
- Content cards: full width within 1160px usable area
- Form: label 100-140px + input auto
- Table: full width, columns auto-distribute
- Dashboard stats: 3-column equal split

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow, bg `#F3F3F3` | 页面背景 |
| Level 1 (Surface) | bg `#FFFFFF`, no shadow | 卡片、内容区、表格 |
| Level 2 (Float) | `0 4px 12px rgba(0,0,0,0.08)` | 下拉菜单、Tooltip |
| Level 3 (Overlay) | `0 2px 8px rgba(0,0,0,0.12)` + overlay bg | 弹窗、抽屉 |

**Shadow Philosophy**: 腾讯公益机构平台采用极简阴影策略——绝大多数界面元素无阴影，仅通过背景色(白色 vs #F3F3F3)和边框(#E7E7E7)区分层次。阴影仅用于浮层（下拉菜单、Tooltip、弹窗），且始终为单层浅灰色阴影，保持界面的扁平专业感。

## 7. Do's and Don'ts

### Do
- 使用 `#ED3142` 仅用于主按钮、选中态、品牌强调——它是唯一的品牌色
- 文字色使用 `rgba(0,0,0, 0.9/0.6/0.4)` 三级透明度——不引入额外灰色色值
- 链接和可操作文字统一使用 `#0052D9`（蓝色）
- 使用 4px 圆角用于按钮/输入框，8px 用于卡片/弹窗
- 使用 `#F3F3F3` 背景色区分层次，而非阴影
- 表格操作列使用蓝色链接文字，多操作用 "·" 或空格分隔
- 必填字段左侧放红色 `*` 星号
- 状态使用圆点(6px) + 文字表示
- 分步表单使用步骤指示器，当前步为红色
- Dashboard 大数字使用 28-48px Bold
- **规范未覆盖的组件，必须使用 TDesign Vue Next（`https://unpkg.com/tdesign-vue-next`）默认样式**

### Don't
- 不要使用纯黑 `#000000`——始终使用 `rgba(0,0,0,0.9)`
- 不要给卡片添加阴影——使用白色背景 + 边框/背景色差区分
- 不要使用 Bold(700) 用于正文——标题用 Semibold(600)，正文用 Regular(400)
- 不要在 `#ED3142` 红色之外引入第二个品牌色
- 不要使用大于 8px 的圆角——体系最大就是 8px（除头像/进度环的50%）
- 不要在表格中使用斑马纹——行底部 1px 边框 + hover 变色即可
- 不要让弹窗宽度超过 960px
- 不要在红色顶部导航栏中使用非白色图标/文字
- 不要跳过表单验证的视觉反馈——错误必须有红色提示文字

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Layout |
|------|-------|--------|
| Desktop Standard | 1440px | 232px sidebar + 1208px content |
| Desktop Small | 1280px | sidebar 可折叠为 64px 图标模式 |

*Note: 本产品为 B 端管理后台，主要面向桌面端 1440px 标准宽度，不做移动端适配。*

### Sidebar Collapse
- 展开态: 232px，显示图标+文字
- 折叠态: 64px，仅显示图标
- 底部汉堡菜单(☰)控制折叠/展开

### Content Area
- 内容区始终满宽，自适应 sidebar 折叠
- 表格横向不滚动——列宽自适应
- 弹窗/抽屉为固定宽度，不随视口变化

## 9. Agent Prompt Guide

### Quick Color Reference
- Page background: `#F3F3F3`
- Card/Content surface: `#FFFFFF`
- Header bar: `#ED3142`
- Primary text: `rgba(0,0,0,0.9)`
- Secondary text: `rgba(0,0,0,0.6)`
- Placeholder: `rgba(0,0,0,0.4)`
- Link/Action: `#0052D9`
- Brand/CTA: `#ED3142`
- Success: `#00A870`
- Border: `#E7E7E7`
- Input border: `#DCDCDC`
- Table header bg: `#F3F3F3`

### Example Component Prompts
- "创建一个列表页：白色卡片(8px圆角)内含表格，表头#F3F3F3背景，14px Semibold。行高48px，底部1px #E7E7E7边框。操作列用#0052D9蓝色链接。上方筛选区：32px高输入框+选择器，右侧红色筛选按钮(#ED3142)+白色重置按钮。"
- "创建一个表单弹窗：960px宽，8px圆角，白色背景。标题16px Semibold。表单左标签(140px宽,右对齐)+右输入框(40px高,#DCDCDC边框,4px圆角)。必填星号*红色放标签左侧。底部右对齐：取消按钮(白底红边红字)+保存按钮(红底白字)。"
- "创建Dashboard数据卡片：3列等分，1px #E7E7E7边框+8px圆角。每个卡片内：12px灰色标题+32px Bold大数字+4px高进度条(红色已用/灰色剩余)。"
- "创建分步表单：顶部步骤指示器(已完成绿色✓+当前红色圆+未到灰色圆，连接线红色/灰色)。底部灰色(#F3F3F3)操作栏居中放4个红色边框按钮。"
- "创建右侧抽屉详情面板：~600px宽，左侧rgba(0,0,0,0.4)遮罩。标题16px Semibold+右上×。内容为Key-Value列表：标签140px宽rgba(0,0,0,0.6)+值rgba(0,0,0,0.9)，行高40px。敏感信息用****脱敏+眼睛图标。"
- "创建可编辑表格：#F3F3F3表头，列标题前带红色*。单元格42px高，内嵌输入框/下拉选择器无边框直接编辑。右侧+/-按钮(24px)增删行。底部合计行Semibold。"

### Iteration Guide
1. 从白色卡片(#FFFFFF)开始，放在灰色页面背景(#F3F3F3)上
2. 品牌红(#ED3142)仅用于主CTA和选中态——克制使用
3. 文字三级：0.9透明度(主) → 0.6(次) → 0.4(辅助)
4. 所有可点击操作文字用蓝色(#0052D9)
5. 4px圆角按钮/输入框，8px圆角卡片/弹窗
6. 无阴影——用背景色和边框区分层次
7. 14px Regular为基准正文，16px Semibold为模块标题
8. 表格是核心——表头灰底，行底边框，操作蓝色链接
