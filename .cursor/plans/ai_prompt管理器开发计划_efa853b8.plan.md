---
name: AI Prompt管理器开发计划
overview: 使用 React + Tauri（桌面端）/ Capacitor（移动端）跨端架构，后端使用 Supabase 云端同步，支持增删改查、分类管理、一键复制、AI优化Prompt 等核心功能。
todos:
  - id: init
    content: 初始化项目结构（pnpm workspaces + 四个应用）
    status: completed
  - id: setup-web
    content: 搭建Web应用核心（React + TypeScript + Vite）
    status: completed
  - id: setup-ui
    content: 配置UI框架（Tailwind + shadcn/ui）
    status: completed
  - id: setup-supabase
    content: 集成Supabase（认证 + 数据库）
    status: completed
  - id: implement-auth
    content: 实现用户认证流程
    status: completed
  - id: implement-prompt-crud
    content: 实现Prompt CRUD功能
    status: completed
  - id: implement-category
    content: 实现分类管理功能
    status: completed
  - id: implement-search
    content: 实现搜索和筛选功能
    status: completed
  - id: implement-copy
    content: 实现一键复制功能
    status: completed
  - id: implement-ai
    content: 实现AI优化Prompt功能
    status: completed
  - id: setup-desktop
    content: 搭建Tauri桌面端
    status: pending
  - id: setup-mobile
    content: 搭建Capacitor移动端
    status: pending
  - id: build-apk
    content: 打包Android应用
    status: pending
isProject: false
---

## 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (共用后端)                       │
│              认证 + PostgreSQL + 实时同步                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│   共享业务逻辑层         │   (Prompt CRUD、分类、搜索、AI优化)  │
├─────────────────────────┼───────────────────────────────────┤
│                         │
│   Web应用/桌面端/移动端   │   微信小程序（原生开发）             │
│   (React 共享代码)       │   (独立代码，共用后端API)            │
│   - Tauri桌面端          │                                    │
│   - Capacitor移动端       │                                    │
│   - 浏览器插件            │                                    │
└─────────────────────────┴───────────────────────────────────┘
```

## 技术栈选择

| 层级 | 技术方案 |
|------|----------|
| 前端框架 | React 18 + TypeScript |
| 跨端方案 | Tauri 2.x (桌面) + Capacitor (移动端) |
| 样式方案 | Tailwind CSS + shadcn/ui |
| 云端服务 | Supabase (认证 + PostgreSQL数据库 + 实时同步) |
| 状态管理 | Zustand |
| AI API | OpenAI GPT / Google Gemini (用户自备API Key) |

## 核心功能模块

### 1. Prompt管理（CRUD）
- 创建Prompt（标题、内容、分类、标签、变量占位符）
- 编辑Prompt（完整编辑）
- 删除Prompt（支持批量删除）
- 查看Prompt（列表视图、详情视图）
- 搜索Prompt（全文搜索、分类筛选、标签筛选）

### 2. 分类管理
- 创建/编辑/删除分类
- 分类层级（支持二级分类）
- 拖拽排序

### 3. 一键复制
- 单个复制
- 批量复制
- 复制历史记录

### 4. AI优化Prompt
- 调用GPT/Gemini优化Prompt
- 支持自定义优化参数
- 优化历史

## 数据库设计（Supabase）

```sql
-- 用户表（Supabase Auth自动管理）
-- profiles表扩展用户信息
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prompt表
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  variables JSONB DEFAULT '[]',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 项目结构

```
prompt-manager/
├── apps/
│   ├── web/                 # Web应用 (React)
│   ├── desktop/            # Tauri桌面端 (复用Web代码)
│   ├── mobile/             # Capacitor移动端 (复用Web代码)
│   └── miniprogram/         # 微信小程序 (原生开发)
├── packages/
│   ├── shared/              # 共享逻辑、类型定义
│   ├── supabase/            # 数据库操作 (共用)
│   └── ai/                  # AI API调用 (共用)
├── package.json             # workspaces根配置
└── README.md
```

## 开发阶段

### 第一阶段：核心Web应用
1. 初始化 React + TypeScript + Vite 项目
2. 配置 Tailwind CSS + shadcn/ui
3. 集成 Supabase 认证（邮箱/第三方登录）
4. 实现Prompt CRUD界面
5. 实现分类管理
6. 实现搜索和筛选

### 第二阶段：高级功能
1. AI优化Prompt功能
2. 一键复制功能
3. 变量占位符系统
4. 使用统计

### 第三阶段：跨端扩展
1. Tauri桌面应用封装
2. Capacitor移动端配置
3. Android APK打包

### 第四阶段：微信小程序
1. 初始化微信小程序项目
2. 对接Supabase后端API
3. 实现与Web一致的Prompt管理功能

### 第五阶段：浏览器插件
1. Chrome扩展开发
2. 快捷键支持
3. 弹出编辑窗口

## 快速启动建议

建议先开发 **Web应用**，验证核心功能和交互流程后再扩展到其他平台。

是否按此计划开始搭建项目？