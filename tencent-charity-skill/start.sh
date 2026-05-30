#!/bin/bash
# 腾讯公益机构平台 - 一键启动
echo "🚀 启动腾讯公益机构平台设计工作流..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 未检测到 Node.js，请先安装 Node.js ≥18"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 版本过低 (当前: $(node -v))，需要 ≥18"
  exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# 安装依赖并启动
cd playground
if [ ! -d "node_modules" ]; then
  echo "📦 首次运行，安装依赖..."
  npm install
fi

echo ""
echo "🎨 启动预览引擎..."
echo "   访问: http://localhost:5173"
echo ""
npm run dev
