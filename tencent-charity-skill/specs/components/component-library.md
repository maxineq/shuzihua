# 腾讯公益机构平台 - 组件规范

> 基于 B 端设计规范 Figma 文件的组件整理提取

## ⚠️ 组件使用强制规则

**当本文档未覆盖的组件，必须使用 TDesign Vue Next 组件库：**

```
组件库 CDN: https://unpkg.com/tdesign-vue-next
图标库 CDN: https://unpkg.com/tdesign-icons-vue-next
组件文档: https://tdesign.tencent.com/vue-next/overview
图标文档: https://tdesign.tencent.com/vue-next/components/icon
```

**禁止行为：**
- ❌ 不允许自行创造规范文档之外的组件样式
- ❌ 不允许使用 TDesign 之外的第三方组件库
- ❌ 不允许凭想象编造交互模式或视觉表现
- ❌ 不允许自行设计/绘制图标，必须使用 tdesign-icons-vue-next 或界面已有图标

**优先级：**
1. 本文档已定义的组件规范 → 严格按照文档执行
2. 本文档未覆盖的组件 → 使用 TDesign Vue Next 默认样式
3. TDesign 也没有的特殊场景 → 需明确提出并获得确认后才可自定义

---

---

## 1. 数据展示组件

### 01 数据卡片 (Stats Card)

**用途**: 首页/列表页顶部的关键指标展示

**变体**:

| 变体 | 结构 | 示例 |
|------|------|------|
| 单指标卡片 | 标题 + 大数字 + 趋势箭头 | "今日筹款 ¥7,919.88 ↑" |
| 双指标卡片 | 标题 + 主数字 + 副指标 | "累计筹款 ¥29,958 / 目标 ¥39,158" |
| 带进度条 | 标题 + 数字 + 进度条 + 百分比 | "募款进度 21,818 / 32,105 (68%)" |
| 带趋势图 | 标题 + 数字 + 迷你折线图 | "周活跃度 1,295 ↑" |

**规格**:
- 高度: 80-120px
- 内边距: 16-24px
- 标题: 12px Regular, rgba(0,0,0,0.6)
- 数字: 24-28px Bold, rgba(0,0,0,0.9)
- 趋势箭头: 绿色(↑上涨) / 红色(↓下降)
- 边框: 1px solid #E7E7E7
- 圆角: 8px
- 布局: 水平等分排列(2-4个一行)

---

### 02 图表组件 (Charts)

**饼图/环形图 (Pie/Donut)**
- 用途: 分类占比展示
- 尺寸: 120-200px 直径
- 色板: 品牌红 + 蓝 + 绿 + 橙 + 紫（按数据量递减使用）
- 图例: 右侧竖排，圆点+名称+数值
- 中心: 可放总数(环形图)

**柱状图/条形图 (Bar)**
- 用途: 数据对比、趋势
- 柱宽: 16-32px
- 柱间距: 8-16px
- 色彩: 主数据用品牌蓝 #0052D9，对比数据用浅色
- X轴标签: 12px, rgba(0,0,0,0.6)
- Y轴标签: 12px, rgba(0,0,0,0.4)
- 网格线: 1px dashed #E7E7E7 (水平)

**折线图 (Line)**
- 用途: 趋势展示
- 线宽: 2px
- 数据点: 4px 圆点，hover 放大到 8px
- 多线色彩: 蓝 / 绿 / 橙 依次使用
- 区域填充: 可选渐变填充(10%透明度)
- Tooltip: 白色卡片 + 阴影，展示具体数值

**地图 (Map)**
- 用途: 地域分布数据
- 底色: 浅灰 #F3F3F3
- 数据区域: 按数值深浅着色(品牌色渐变)
- 标注点: 蓝色圆点，大小映射数值
- 图例: 色阶条 + 数值范围

---

### 03 数据卡片扩展 (Data Display)

**关键指标行**
- 布局: 水平排列，标签+数值成对
- 标签: 12px, rgba(0,0,0,0.6)
- 数值: 14-16px Semibold, rgba(0,0,0,0.9)
- 分隔: 竖线(1px #E7E7E7) 或 间距(32px)

---

## 2. 表单组件

### 04 表单 (Form)

**输入框 (Input)**
| 状态 | 边框 | 背景 | 文字色 |
|------|------|------|--------|
| Default | 1px #DCDCDC | #FFFFFF | rgba(0,0,0,0.9) |
| Hover | 1px #0052D9 | #FFFFFF | — |
| Focus | 1px #0052D9 | #FFFFFF | — |
| Error | 1px #ED3142 | #FFFFFF | — |
| Disabled | 1px #E7E7E7 | #F3F3F3 | rgba(0,0,0,0.4) |
| Readonly | none | transparent | rgba(0,0,0,0.9) |

**选择器 (Select)**
- 同输入框基础样式
- 右侧: 下箭头图标 16px, rgba(0,0,0,0.4)
- 下拉面板: 白底 + 阴影(0 4px 12px rgba(0,0,0,0.08))
- 选项高度: 32px
- 选中项: 蓝色文字 #0052D9 + 右侧 ✓

**日期选择器 (DatePicker)**
- 触发框: 同输入框 + 右侧日历图标
- 面板: 白底弹出，7列日历网格
- 今天: 蓝色边框圆圈
- 选中日: 蓝色填充圆 + 白色文字
- 范围: 起止日蓝色圆 + 中间浅蓝底

**单选框 (Radio)**
- 尺寸: 16px 圆形
- 未选中: 1px #DCDCDC 边框
- 选中: #ED3142 填充 + 白色内圆点
- 标签间距: 8px

**复选框 (Checkbox)**
- 尺寸: 16px 方形，2px圆角
- 未选中: 1px #DCDCDC 边框
- 选中: #0052D9 填充 + 白色 ✓
- 半选: #0052D9 填充 + 白色 -
- 标签间距: 8px

**开关 (Switch)**
- 尺寸: 36px × 20px
- 关闭: #DCDCDC 背景，白色圆点左侧
- 开启: #0052D9 背景，白色圆点右侧

**文件上传 (Upload)**
- 拖拽区: 虚线边框(1px dashed #DCDCDC), 居中上传图标+提示文字
- 已上传: 文件名 + 大小 + 删除图标
- 图片上传: 缩略图网格(112×112px), "+添加"占位格

### ⚠️ 04-B 筛选区模板（强制遵循）

列表页筛选区是最常见的组件组合，必须严格按以下规范执行：

**布局结构：**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─── 筛选框组（flex: 1, 自动换行）───────────┐  ←88px→  ┌──按钮组──┐ │
│ │ [输入框1]  ←24px→  [选择器2]  ←24px→  [选择器3] │         │[查询][重置]│ │
│ │ [日期范围]  ←24px→  [选择器5]                    │         │          │ │
│ └──────────────────────────────────────────────┘         └──────────┘ │
│                                                    ↑ 按钮与最后一行底部对齐 │
└─────────────────────────────────────────────────────────────────────────┘
```

**强制规则：**

| 属性 | 值 | 说明 |
|------|-----|------|
| 整体布局 | `display: flex; gap: 88px; align-items: flex-end;` | 按钮始终与最后一行筛选框底部对齐 |
| 筛选框组 | `flex: 1; display: flex; flex-wrap: wrap; gap: 24px;` | 自动换行，间距 24px |
| 单个筛选框 | `flex: 1; min-width: 200px;` | 等宽分配，最小 200px |
| 按钮组 | `flex-shrink: 0; display: flex; gap: 8px;` | 不被压缩，按钮间距 8px |
| 查询按钮 | `theme="primary"` (品牌色 #ED3142) | 主按钮 |
| 重置按钮 | 背景 `#E7E7E7`，文字 `rgba(0,0,0,0.9)` | 灰色辅助按钮 |
| 按钮高度 | 32px，圆角 3px，padding 5px 16px | 与输入框等高对齐 |
| 输入框高度 | 32px，圆角 3px，border 1px solid #DCDCDC | 标准筛选输入 |

**必须包含两个按钮：** 查询 + 重置（缺一不可）

**TDesign 实现代码模板：**
```html
<div class="filter-area">
  <div class="filter-inputs">
    <t-input placeholder="请输入关键词" clearable></t-input>
    <t-select placeholder="请选择状态" clearable>
      <t-option label="全部" value="all"></t-option>
    </t-select>
    <!-- 更多筛选框... -->
  </div>
  <div class="filter-buttons">
    <t-button theme="primary" @click="handleQuery">查询</t-button>
    <t-button class="btn-reset" @click="handleReset">重置</t-button>
  </div>
</div>
```

```css
.filter-area {
  display: flex;
  gap: 88px;
  align-items: flex-end;
  margin-bottom: 24px;
}
.filter-inputs {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.filter-inputs > * {
  flex: 1;
  min-width: 200px;
}
.filter-buttons {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}
.btn-reset {
  background: #E7E7E7 !important;
  color: rgba(0,0,0,0.9) !important;
  border: none !important;
}
```

**多行场景示例：** 当筛选框超过一行时，按钮自动与最后一行底部对齐（因为外层是 `align-items: flex-end`），无需额外处理。

---

## 3. 弹窗 & 浮层组件

### 05 弹窗 (Dialog/Modal)

| 类型 | 宽度 | 用途 |
|------|------|------|
| 确认弹窗 | 320px | 删除确认、操作确认 |
| 信息弹窗 | 480px | 回复留言、快捷编辑 |
| 表单弹窗 | 640-960px | 编辑备案、复杂表单 |
| 全屏弹窗 | 80% viewport | 预览、大表单 |

**通用结构**:
- Header: 标题(16px Semibold) + × 关闭按钮
- Body: 内容区, padding 24px
- Footer: 操作按钮右对齐, 取消+确认

**⚠️ 位置与尺寸（强制遵循）**:

| 属性 | 值 | 说明 |
|------|-----|------|
| 水平位置 | 水平居中 | 遮罩层内 `margin: 0 auto` |
| 垂直位置 | **上下居中** | `top: 50%; transform: translateY(-50%)` 或 Flex 垂直居中，不得固定 top 偏移 |
| 最大宽度 | **960px** | 超出宽度时弹窗宽度锁定 960px |
| 最大高度 | **740px** | 超出高度时弹窗高度锁定 740px |
| 内容超出 | Body 区域可滚动 | `overflow-y: auto`，Header 和 Footer 固定，仅 Body 滚动 |
| 遮罩 | `rgba(0,0,0,0.4)` | 全屏覆盖 |

**CSS 模板（覆盖 TDesign 默认弹窗定位）：**
```css
/* 弹窗居中定位 */
.t-dialog__ctx {
  display: flex;
  align-items: center;
  justify-content: center;
}
.t-dialog {
  position: relative;
  top: unset;
  left: unset;
  transform: none;
  max-width: 960px;
  max-height: 740px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
/* Body 区域独立滚动，Header/Footer 固定 */
.t-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.t-dialog__header,
.t-dialog__footer {
  flex-shrink: 0;
}
```

**禁止行为：**
- ❌ 不得将弹窗固定在 `top: 100px` 等固定偏移位置，必须上下居中
- ❌ 不得让整个弹窗（含 Header/Footer）整体滚动，只允许 Body 内容区滚动
- ❌ 弹窗宽度不得超过 960px，高度不得超过 740px

### 06 抽屉 (Drawer)

- 方向: 右侧滑入
- 宽度: 480-720px
- 遮罩: rgba(0,0,0,0.4)
- 头部: 标题 + × 关闭
- 可嵌套表格、Key-Value列表

### 07 提示 (Toast/Message)

| 类型 | 图标 | 颜色 | 自动关闭 |
|------|------|------|---------|
| 成功 | ✓ 圆形 | #00A870 | 1.5s |
| 错误 | × 圆形 | #ED3142 | 2s |
| 警告 | ! 三角 | #FF9C00 | 3s |
| 信息 | i 圆形 | #0052D9 | 2s |
| 加载中 | loading | — | 不自动关闭 |

- 位置: 页面顶部居中
- 宽度: auto (内容自适应)
- 最大宽度: 500px

---

## 4. 导航组件

### 08 左侧导航菜单 (Sidebar)

**结构**:
```
Logo区域 (64px高)
─────────────────
分组名称 (12px, 灰色)
  一级菜单项 (36px高)
    二级菜单项 (36px高, 左缩进)
    二级菜单项 (选中: 红色文字+浅红背景)
─────────────────
分组名称
  一级菜单项
─────────────────
底部操作 (折叠按钮 ☰)
```

**菜单项状态**:
| 状态 | 文字色 | 背景 | 图标 |
|------|--------|------|------|
| 默认 | #5B5050 | transparent | #5B5050 棕灰色 |
| Hover | #5B5050 | #F3F3F3 | — |
| 选中 | #ED3142 | rgba(237,49,66,0.1) | 红色 |
| 展开 | #5B5050 | — | chevron-up |
| 折叠 | #5B5050 | — | chevron-down |

### 09 面包屑 (Breadcrumb)
- 分隔符: `/` (14px, rgba(0,0,0,0.4))
- 链接项: 14px, #0052D9
- 当前项: 14px, rgba(0,0,0,0.9) (不可点击)

### 10 顶部导航 (Header)
- 高度: 64px
- 背景: #ED3142
- 左侧: Logo + 平台名称 "腾讯公益 · 机构服务平台" (白色, 16px)
- 右侧: 消息图标(带Badge) + 用户头像(40px圆形)
- 文字: #FFFFFF
- 内边距: 左右 24px，上下居中

---

## 5. 反馈 & 状态组件

### 11 空状态 (Empty State)

| 场景 | 图标 | 文案 | 操作 |
|------|------|------|------|
| 无数据 | 空状态插画 | "暂无数据" | [新建XXX] 按钮(可选) |
| 搜索无结果 | 搜索类空状态插画 | "未找到相关结果" | "清除筛选条件" 链接 |
| 无权限 | 权限类空状态插画 | "暂无权限访问" | "联系管理员" 链接 |
| 网络错误 | 异常类空状态插画 | "网络异常" | [重试] 按钮 |
| 业务记录为空 | 空状态插画 | "暂无XX记录" | [添加/新建第一条XX记录] 按钮 |

**规格**:
- 插画源: 优先使用 B 端设计规范 Figma 节点 `15-1941` 的空状态插画结构
- 图标/插画: 64-120px，推荐 96px × 96px
- 颜色: 必须替换为腾讯公益规范色系，不直接使用 Figma 原蓝灰色；推荐公益红 `#ED3142`、浅红 `#FEF0F0` / `rgba(237,49,66,0.08)`、中性灰 `#C9CDD4`
- 文案: 14px, rgba(0,0,0,0.4)
- 位置: 区域内垂直水平居中
- 操作按钮: 默认按钮或 outline 按钮；若引导创建第一条记录，文案使用 `添加第一条XX记录`
- 资源沉淀: 图片资源上传 CDN 后使用线上链接，例如 `https://ssv-design.ssv.tencent.com/tencent-charity/tencent-charity-design-skill/playground/src/cases/beneficiary-detail/assets/empty-state/empty-record-charity.svg`

### 12 Loading 加载

| 类型 | 用途 | 表现 |
|------|------|------|
| 全局 Loading | 页面切换 | 遮罩 + 居中 spinner |
| 区域 Loading | 表格/卡片加载 | 区域内居中 spinner |
| 按钮 Loading | 提交中 | 按钮内 spinner + "提交中..." |
| 骨架屏 | 首次加载 | 灰色矩形块动画 |

**Spinner 规格**:
- 尺寸: 24px (按钮内) / 32px (区域) / 48px (全局)
- 颜色: #0052D9 (蓝色旋转)
- 动画: 顺时针旋转, 1s 一圈

### 13 进度条/进度环

**进度条 (Progress Bar)**
- 高度: 4px (细) / 8px (粗)
- 背景轨道: #E7E7E7
- 填充: #ED3142 (品牌) 或 #0052D9 (信息)
- 圆角: 4px (两端圆形)
- 标签: 右侧百分比数字(12px)

**进度环 (Progress Circle)**
- 直径: 64px (小) / 112px (大)
- 轨道: 4px #E7E7E7
- 填充: 4px #ED3142
- 中心: 百分比(16-20px Bold)

---

## 6. 状态标识使用铁律（强制遵循）

### ⚠️ 表格内状态：必须用圆点 + 文字，禁止用 Tag 色块

表格中展示状态时，**严禁使用 `<t-tag>` 色块标签**，必须使用 6px 圆点 + 文字：

```html
<!-- ✅ 正确：圆点 + 文字 -->
<span class="status-dot status-success"></span><span>已拨付</span>

<!-- ❌ 错误：Tag 色块 -->
<t-tag theme="success">已拨付</t-tag>
```

**圆点颜色对照表：**
| 状态语义 | 圆点颜色 | 文字色 | 示例 |
|---------|---------|--------|------|
| 成功/通过/正常/启用 | `#00A870` | `rgba(0,0,0,0.9)` | 已拨付、已通过、正常、启用、进行中 |
| 进行中/处理中 | `#FF9C00` | `rgba(0,0,0,0.9)` | 拨付中、审核中 |
| 待处理/默认/停用 | `#DCDCDC` | `rgba(0,0,0,0.6)` | 待拨付、草稿中、待审核、已结束、停用 |
| 失败/驳回/冻结 | `#ED3142` | `#ED3142` | 拨付失败、已驳回、已冻结 |

**圆点 CSS 规范：**
- 尺寸：6px × 6px，border-radius: 50%
- 与文字间距：8px
- 驳回类状态可附加 ⓘ 图标（14px，间距 4px）

### ⚠️ 卡片/非表格场景：可以用 Tag，但必须放在标题右侧

在卡片、详情页等非表格场景中，允许使用 `<t-tag>` 标签，但**必须紧跟标题右侧**，不得放在卡片底部或内容区域中。

```html
<!-- ✅ 正确：Tag 在标题右侧 -->
<div class="card-header" style="display:flex;align-items:center;justify-content:space-between;">
  <span class="title">春季助学金拨付 - 批次01</span>
  <t-tag theme="warning">待审批</t-tag>
</div>

<!-- ❌ 错误：Tag 放在卡片底部 -->
<div class="card-footer">
  <t-tag theme="warning">待审批</t-tag>
</div>
```

**Tag 颜色规范（覆盖 TDesign 默认色）：**
| 变体 | 背景 | 文字色 | 边框 |
|------|------|--------|------|
| Success/通过 | `#E8F8EF` | `#00A870` | 无 |
| Warning/待审批 | `#FFF3E0` | `#FF9C00` | `1px solid #FF9C00` |
| Error/驳回 | `#FEF0F0` | `#ED3142` | 无 |
| Default/默认 | `#FFFFFF` | `rgba(0,0,0,0.9)` | `1px solid #DCDCDC` |
| Selected/选中 | `#ED3142` | `#FFFFFF` | 无 |

**Tag 尺寸：** padding 2px 8px，font-size 12px，border-radius 4px

---

## 7. 业务专属组件

### 14 项目卡片

**规格**:
- 标题: 项目ID + 项目名称(双行)
- 状态: 状态圆点(6px) + 文字
- 数据: 筹款金额、参与人数等
- 操作: "查看" / "更多操作"

### 15 审核状态流

**步骤展示**:
```
提交 → 公募审核 → 平台审核 → 上线
  ↓         ↓          ↓
 驳回      驳回       驳回
```

**状态标识**:
- 通过: 绿色 ✓
- 驳回: 红色 ×
- 进行中: 蓝色 loading
- 待处理: 灰色 ○

### 16 协议/声明组件

- Checkbox + 长文本声明
- "查看详情" 链接展开协议全文
- 协议全文: 弹窗或新页面展示
- 必须勾选才可提交

---

## 7. 表格组件规范（强制遵循）

### ⚠️ `<t-table>` 使用铁律

**属性规则：**
| 属性 | 要求 | 说明 |
|------|------|------|
| `bordered` | **禁止使用** | 表格不加外边框，仅行底部有分割线 |
| `stripe` | **禁止使用** | 不使用斑马纹，行背景统一为白色 |
| `hover` | **必须使用** | 鼠标悬停行高亮为 #F3F3F3 |
| `row-key` | **必须指定** | 指定唯一键用于行标识 |

**样式规范（CSS 覆盖 TDesign 默认值）：**

| 元素 | 属性 | 规范值 |
|------|------|--------|
| 表头 th | background | `#F3F3F3` |
| 表头 th | font-size / weight | 14px / Regular(400) |
| 表头 th | color | `rgba(0,0,0,0.4)` |
| 表头 th | padding | 16px |
| 表头 th | border-bottom | 1px solid `#E7E7E7` |
| 单元格 td | font-size | 14px |
| 单元格 td | color | `rgba(0,0,0,0.9)` |
| 单元格 td | padding | 16px |
| 单元格 td | border-bottom | 1px solid `#E7E7E7` |
| 行 hover | background | `#F3F3F3` |
| 操作列链接 | color | `#0052D9` |
| 操作列链接间距 | gap | 24px |
| 分页当前页 | background | `#ED3142`（品牌色） |
| 分页当前页 | color | `#FFFFFF` |

**CSS 覆盖模板：**
```css
.t-table__header th {
  background: #F3F3F3 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  color: rgba(0,0,0,0.4) !important;
  border-bottom: 1px solid #E7E7E7 !important;
  padding: 16px !important;
}
.t-table__body td {
  font-size: 14px !important;
  color: rgba(0,0,0,0.9) !important;
  border-bottom: 1px solid #E7E7E7 !important;
  padding: 16px !important;
}
.t-table__row:hover td { background: #F3F3F3 !important; }
.t-table__row--stripe td { background: transparent !important; }
.t-link { color: #0052D9 !important; }
.t-pagination__btn--current {
  background: #ED3142 !important;
  color: #FFFFFF !important;
  border-color: #ED3142 !important;
}
```

**TDesign 表格使用模板：**
```html
<t-table
  :data="tableData"
  :columns="columns"
  row-key="id"
  hover
></t-table>
```

**禁止行为：**
- ❌ 不得添加 `bordered` 属性（无外边框）
- ❌ 不得添加 `stripe` 属性（无斑马纹）
- ❌ 不得自定义表头为深色背景（只能用 #F3F3F3 浅灰）
- ❌ 不得在操作列使用按钮，必须用 `<t-link>` 链接文字

### ⚠️ 操作列规范

| 属性 | 值 | 说明 |
|------|-----|------|
| 链接颜色 | `#0052D9` | 统一蓝色链接 |
| 链接间距 | 24px（`gap: 24px`） | 操作之间 |
| 换行 | **禁止换行**（`white-space: nowrap; flex-wrap: nowrap;`） | 单行展示 |
| 一行最多操作数 | **3 个** | 超过 3 个用"更多"下拉收起 |
| 列宽 | 根据操作数量设置足够宽度，确保不被截断 | 2 个操作≈180px，3 个操作≈260px |
| 固定位置 | `fixed: 'right'` | 操作列固定在右侧 |

**操作列代码模板：**
```javascript
{
  colKey: 'operation',
  title: '操作',
  width: 260,  // 3个操作时260px，2个操作时180px
  fixed: 'right',
  cell: (h, { row }) => {
    return h('div', { style: 'display:flex;align-items:center;gap:24px;white-space:nowrap;' }, [
      h(TDesign.Link, { theme: 'primary' }, () => '操作1'),
      h(TDesign.Link, { theme: 'primary' }, () => '操作2'),
      h(TDesign.Link, { theme: 'primary' }, () => '更多')
    ]);
  }
}
```

**宽度参考：**
| 操作数量 | 推荐列宽 | 示例 |
|---------|---------|------|
| 1 个 | 100px | "查看" |
| 2 个 | 180px | "编辑"、"查看" |
| 3 个 | 260px | "微信拨付"、"拨付记录"、"更多" |

---

## 8. 按钮使用规范（强制遵循）

### ⚠️ 操作按钮行铁律：只允许一个实心主按钮

页面操作按钮行中，**最多只能有一个实心主按钮（theme="primary"）**，其余所有按钮必须使用线框样式（variant="outline"）。

**规则：**
| 按钮类型 | TDesign 写法 | 样式 | 数量限制 |
|---------|-------------|------|---------|
| 主要操作（唯一） | `<t-button theme="primary">` | 实心品牌色(#ED3142)背景 + 白字 | **仅 1 个** |
| 次要操作 | `<t-button variant="outline">` | 白色背景 + 品牌色边框 + 品牌色文字 | 不限 |
| 筛选区-查询 | `<t-button theme="primary">` | 实心品牌色 | 固定 |
| 筛选区-重置 | `<t-button class="btn-reset">` | #E7E7E7 灰色背景 | 固定 |

**正确示例：**
```html
<div class="action-row">
  <t-button theme="primary">+ 新建拨付单</t-button>       <!-- 唯一主按钮 -->
  <t-button variant="outline">批量导入</t-button>          <!-- 线框 -->
  <t-button variant="outline">数据导出</t-button>          <!-- 线框 -->
</div>
```

**错误示例：**
```html
<!-- ❌ 多个实心按钮 -->
<div class="action-row">
  <t-button theme="primary">新建</t-button>
  <t-button theme="primary">批量导入</t-button>
  <t-button theme="primary">导出</t-button>
</div>
```

**主按钮选择原则：** 选择该页面最核心、最高频的操作作为唯一主按钮（通常是"新建/创建"类操作）。

---

## 9. 组件使用规则

### 组件选择决策树

```
展示数据？
├─ 大量结构化数据 → 表格
├─ 少量 Key-Value → 详情列表
├─ 统计指标 → 数据卡片
├─ 趋势/分布 → 图表
└─ 单条信息 → 文本展示

收集数据？
├─ 简单录入 → 基础表单
├─ 多步骤 → 分步表单
├─ 快捷修改 → 弹窗表单
└─ 批量操作 → 表格内编辑

用户操作？
├─ 危险操作 → 确认弹窗
├─ 查看详情(不离开) → 抽屉
├─ 快捷编辑(不离开) → 弹窗
└─ 完整编辑 → 跳转表单页
```

### 组件间距规范

| 场景 | 间距 |
|------|------|
| 组件内元素间 | 8px |
| 相关组件间 | 16px |
| 模块间 | 24px |
| 大区块间 | 32px |
| 按钮组内 | 8-12px |
| 表单项间 | 24px |

### 一致性检测规则（强制遵循）

AI 在生成或修改页面后，必须扫描当前界面内同属性/同语义/同层级的组件和内容，确保它们具有一致的样式和交互。

**检测范围：**
- 视觉样式：颜色、字号、字重、圆角、边框、阴影、背景、图标尺寸
- 布局间距：内边距、外边距、栅格列数、对齐方式、模块间距
- 内容结构：标题/说明/标签/数值的层级、顺序、换行和空态表现
- 状态表现：默认、hover、active、selected、disabled、loading、error、success
- 交互行为：点击区域、跳转方式、校验触发、反馈 Toast、弹窗确认、数据保留

**强制规则：**
1. 同一页面中，同属性组件必须复用同一 class / token / 组件封装，禁止复制后局部改样式。
2. 同语义内容必须使用一致的展示结构，例如所有确认信息项都使用同一 `label/value` 卡片结构。
3. 同层级操作必须保持一致交互，例如同一按钮组中的次要按钮都使用 `variant="outline"`，同一类列表项点击区域一致。
4. 状态文案语义一致时，必须使用同一状态映射表，不得同一状态一处用 Tag、一处用圆点，除非规范明确区分表格/卡片场景。
5. 如确需差异，必须能说明明确业务语义，并通过命名变体表达，例如 `confirm-item--full`、`status-pill--process`。
