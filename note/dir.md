# AI Prompt 管理器 - 项目目录结构

## 目录树状图

```
prompt-manager/
|
├── .cursor/                           # Cursor IDE 配置目录
│   ├── debug-68d062.log              # 调试日志
│   └── plans/
│       └── ai_prompt管理器开发计划_efa853b8.plan.md    # 开发计划文档
│
├── apps/                              # 应用目录（monorepo）
│   └── web/                           # Web 应用（主要应用）
│       ├── .env                       # 环境变量（包含 Supabase 配置）
│       ├── .env.example               # 环境变量模板
│       ├── index.html                 # HTML 入口文件
│       ├── package.json               # Web 应用依赖配置
│       ├── postcss.config.js          # PostCSS 配置（处理 CSS）
│       ├── tailwind.config.js         # Tailwind CSS 配置
│       ├── tsconfig.json              # TypeScript 配置
│       ├── tsconfig.node.json         # Node 环境 TypeScript 配置
│       ├── vite.config.ts             # Vite 构建工具配置
│       ├── vite.config.js             # Vite 配置（备选）
│       ├── vite.config.d.ts           # Vite 类型声明
│       │
│       ├── dist/                      # 构建输出目录（生产环境）
│       │   ├── index.html             # 构建后的 HTML
│       │   └── assets/                # 打包后的静态资源
│       │
│       └── src/                       # 源代码目录
│           ├── App.tsx                # React 根组件
│           ├── main.tsx               # React 入口文件
│           ├── vite-env.d.ts          # Vite 类型声明
│           ├── index.css              # 全局样式
│           │
│           ├── contexts/              # React Context 状态管理
│           │   ├── AuthContext.tsx    # 认证状态管理（登录/登出）
│           │   └── PromptContext.tsx # Prompt 数据状态管理
│           │
│           ├── lib/                   # 工具库
│           │   └── supabase.ts       # Supabase 客户端配置
│           │
│           ├── pages/                 # 页面组件
│           │   ├── DashboardPage.tsx # 仪表盘页面
│           │   ├── LoginPage.tsx      # 登录页面
│           │   ├── PromptDetailPage.tsx  # Prompt 详情页
│           │   ├── PromptListPage.tsx    # Prompt 列表页
│           │   └── SettingsPage.tsx   # 设置页面
│           │
│           └── types/                 # TypeScript 类型定义
│               └── index.ts           # 共享类型定义
│
├── packages/                          # 共享包目录
│   └── shared/                        # 共享类型定义包
│       ├── package.json              # 包配置
│       ├── tsconfig.json              # TypeScript 配置
│       └── src/
│           └── index.ts               # 共享类型/工具导出
│
├── supabase/                          # Supabase 后端配置
│   └── schema.sql                     # 数据库 Schema（表结构定义）
│
├── package.json                       # 根目录 package.json（monorepo 配置）
├── pnpm-lock.yaml                     # pnpm 依赖锁定文件
├── pnpm-workspace.yaml                # pnpm 工作区配置
├── README.md                          # 项目说明文档
└── .gitignore                         # Git 忽略文件配置
```

---

## 文件功能详解

### 根目录配置文件

| 文件 | 功能说明 |
|------|----------|
| `package.json` | **根配置**：定义 monorepo 工作区结构，包含 `apps/*` 和 `packages/*`，提供 `dev:web`、`build:web` 等脚本命令 |
| `pnpm-workspace.yaml` | **pnpm 工作区配置**：声明工作区包含 `apps/*` 和 `packages/*` 目录 |
| `pnpm-lock.yaml` | **依赖锁定文件**：锁定所有依赖的精确版本，确保团队成员安装相同版本 |
| `README.md` | **项目说明文档**：包含技术栈、功能特性、快速开始指南、环境变量配置等 |
| `.gitignore` | **Git 忽略配置**：忽略 `node_modules`、`dist`、`.env` 等不需要提交的文件 |

### Cursor IDE 配置

| 文件 | 功能说明 |
|------|----------|
| `.cursor/debug-68d062.log` | **调试日志**：记录 Cursor IDE 运行时的调试信息 |
| `.cursor/plans/*.plan.md` | **开发计划文档**：记录 AI Prompt 管理器的详细开发计划 |

### Web 应用核心配置 (`apps/web/`)

| 文件 | 功能说明 |
|------|----------|
| `vite.config.ts` | **Vite 构建配置**：定义开发服务器端口、热更新、构建选项等 |
| `tailwind.config.js` | **Tailwind CSS 配置**：定义主题颜色、断点、插件等 |
| `postcss.config.js` | **PostCSS 配置**：配置 CSS 预处理器的插件（如 autoprefixer） |
| `tsconfig.json` | **TypeScript 配置**：定义编译选项、路径别名、严格模式等 |
| `.env` / `.env.example` | **环境变量**：存储 Supabase URL 和 Anon Key 等敏感配置 |

### Web 应用源码 (`apps/web/src/`)

| 文件 | 功能说明 |
|------|----------|
| `main.tsx` | **入口文件**：渲染 React 应用到 DOM |
| `App.tsx` | **根组件**：定义应用的整体布局和路由结构 |
| `index.css` | **全局样式**：定义 CSS 变量、全局重置样式等 |
| `contexts/AuthContext.tsx` | **认证上下文**：管理用户登录状态、用户信息，提供 `login()`、`logout()` 方法 |
| `contexts/PromptContext.tsx` | **Prompt 上下文**：管理 Prompt 的增删改查、分类、标签等状态 |
| `lib/supabase.ts` | **Supabase 客户端**：初始化并导出 Supabase 客户端实例 |
| `pages/DashboardPage.tsx` | **仪表盘页面**：展示统计数据、最近使用的 Prompt 等概览信息 |
| `pages/LoginPage.tsx` | **登录页面**：提供用户登录/注册功能 |
| `pages/PromptListPage.tsx` | **Prompt 列表页**：展示所有 Prompt，支持搜索、分类筛选、标签过滤 |
| `pages/PromptDetailPage.tsx` | **Prompt 详情页**：查看单个 Prompt 的完整内容，支持编辑 |
| `pages/SettingsPage.tsx` | **设置页面**：管理分类、标签、账户设置等 |
| `types/index.ts` | **类型定义**：定义 `Prompt`、`Category`、`Tag` 等数据结构 |

### 共享包 (`packages/shared/`)

| 文件 | 功能说明 |
|------|----------|
| `src/index.ts` | **导出入口**：导出所有共享类型和工具函数，供 `apps/*` 调用 |

### 数据库 Schema (`supabase/`)

| 文件 | 功能说明 |
|------|----------|
| `schema.sql` | **数据库表结构**：定义 `profiles`、`prompts`、`categories`、`tags` 等数据表的 SQL 脚本 |

---

## 技术架构概览

```
┌─────────────────────────────────────────────────────────┐
│                     前端（React 18）                      │
├─────────────────────────────────────────────────────────┤
│  apps/web (Web 应用)                                      │
│  ├── pages/          页面组件（Dashboard, Login, List...）│
│  ├── contexts/       状态管理（Auth, Prompt）              │
│  ├── lib/            工具库（Supabase 客户端）            │
│  └── types/          TypeScript 类型定义                  │
├─────────────────────────────────────────────────────────┤
│  packages/shared    共享类型定义（跨应用复用）             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    云端（Supabase）                       │
│  ├── 认证服务（Auth）                                     │
│  └── PostgreSQL 数据库                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 依赖说明

### 主要生产依赖

- **React 18.3.1** - UI 框架
- **React Router DOM 6.26** - 路由管理
- **Supabase JS Client 2.45** - 后端数据库交互
- **Zustand 4.5** - 状态管理（虽然代码中用了 Context）
- **Tailwind CSS 3.4** - 原子化 CSS 样式框架
- **Lucide React 0.428** - 图标库

### 开发依赖

- **TypeScript 5.5** - 类型检查
- **Vite 5.4** - 构建工具
- **PostCSS / Autoprefixer** - CSS 处理
