# AI Prompt 管理器 - 项目目录结构

## 目录树状图

```
prompt-manager/
|
├── .cursor/                           # Cursor IDE 配置目录
│   └── plans/
│       └── ai_prompt管理器开发计划_efa853b8.plan.md
│
├── apps/                              # 应用目录（monorepo）
│   ├── web/                           # Web 应用（主应用，desktop/mobile 复用）
│   │   ├── .env / .env.example        # Supabase 环境变量
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   ├── dist/                      # 构建输出
│   │   └── src/
│   │       ├── main.tsx               # React 入口
│   │       ├── App.tsx                # 根组件与路由
│   │       ├── index.css
│   │       ├── contexts/              # AuthContext / PromptContext
│   │       ├── lib/supabase.ts        # Supabase 客户端
│   │       ├── pages/                 # Dashboard / Login / PromptList / Detail / Settings
│   │       └── types/index.ts
│   │
│   ├── desktop/                       # Tauri 2 桌面端（封装 web）
│   │   ├── package.json
│   │   └── src-tauri/
│   │       ├── Cargo.toml
│   │       ├── tauri.conf.json        # 指向 apps/web 构建产物
│   │       ├── src/main.rs / lib.rs
│   │       ├── capabilities/
│   │       └── icons/
│   │
│   ├── mobile/                        # Capacitor 7 移动端（封装 web）
│   │   ├── package.json
│   │   ├── capacitor.config.ts        # webDir → ../web/dist
│   │   └── android/                   # Android 原生工程
│   │
│   ├── flutter/                       # Flutter 原生移动端（Android / iOS）
│   │   ├── README.md
│   │   ├── pubspec.yaml               # Dart 依赖与资源声明
│   │   ├── analysis_options.yaml
│   │   ├── .env / .env.example        # Supabase 环境变量
│   │   ├── note/                      # Flutter 子文档（arch / dir / module）
│   │   ├── lib/
│   │   │   ├── main.dart              # 入口：dotenv、Supabase、Provider
│   │   │   ├── app.dart               # GoRouter 路由与应用壳
│   │   │   ├── config/app_config.dart # 读取 .env，拼接 Edge Function URL
│   │   │   ├── models/                # Prompt / Category / Variable
│   │   │   ├── providers/             # AuthProvider / PromptProvider
│   │   │   ├── screens/               # Login / Dashboard / List / Detail / Categories
│   │   │   └── services/              # PromptRepository / AiService / CopyHistoryService
│   │   ├── android/                   # Android 原生工程
│   │   ├── ios/                       # iOS 原生工程
│   │   └── test/widget_test.dart
│   │
│   ├── extension/                     # Chrome 浏览器扩展（MV3）
│   │   ├── README.md
│   │   ├── manifest.json              # MV3 源文件（构建时拷贝到 dist）
│   │   ├── package.json
│   │   ├── vite.config.ts             # 多入口：popup / sidepanel / options / background / content
│   │   ├── popup.html                 # 工具栏弹出页
│   │   ├── sidepanel.html             # 侧边栏（主入口）
│   │   ├── options.html               # 选项页
│   │   ├── dist/                      # 构建输出，用于「加载未打包扩展」
│   │   ├── note/                      # 扩展子文档（arch / dir / module）
│   │   └── src/
│   │       ├── main.tsx               # React 挂载入口
│   │       ├── App.tsx                # 主 UI：列表 / 搜索 / 复制 / AI 优化 / 登录
│   │       ├── background.ts          # Service Worker：同步 / 右键菜单 / 消息路由
│   │       ├── content/contentScript.ts  # 网页内 Prompt 插入与 Toast
│   │       ├── usePromptData.ts       # 本地 storage + Supabase 协调钩子
│   │       ├── supabase.ts            # Supabase 客户端 + CRUD / sync / AI 优化
│   │       ├── storage.ts             # chrome.storage.local 读写
│   │       ├── syncService.ts         # 后台定时同步
│   │       ├── contextMenus.ts        # 右键菜单（插入 Prompt / 保存选中文本）
│   │       ├── messaging.ts           # 扩展内消息常量与类型
│   │       ├── insertPrompt.ts        # 侧栏 → 当前标签页插入
│   │       ├── tabInsert.ts           # background 侧标签页插入逻辑
│   │       ├── promptClipService.ts   # 选中文本保存为 Prompt
│   │       ├── runtime.ts             # VITE_* 运行时配置
│   │       ├── store.ts               # Zustand 全局状态（可选）
│   │       ├── types.ts               # Prompt / Category / AuthState 等
│   │       ├── mockData.ts            # 首次空库种子数据
│   │       ├── browser.ts             # 扩展环境探测
│   │       ├── manifest.ts            # manifest 常量（TypeScript）
│   │       └── extension.d.ts         # Chrome / Vite 类型声明
│   │
│   └── miniprogram/                   # 微信小程序
│       ├── README.md
│       ├── app.json                   # 全局配置与 tabBar
│       ├── app.ts / app.wxss          # 小程序入口与全局样式
│       ├── project.config.json        # 微信开发者工具项目配置
│       ├── project.private.config.example.json
│       ├── sitemap.json
│       ├── tsconfig.json
│       ├── package.json               # 仅 devDependencies（类型检查）
│       ├── config/
│       │   ├── config.example.ts      # Supabase 配置模板
│       │   └── config.ts              # 实际配置（gitignore）
│       ├── pages/
│       │   ├── login/                 # 邮箱密码登录 / 注册
│       │   ├── index/                 # 首页仪表盘
│       │   ├── prompts/
│       │   │   ├── list/              # Prompt 列表（搜索 / 筛选 / 批量操作）
│       │   │   └── detail/            # 新建 / 编辑 / AI 优化
│       │   └── categories/index/      # 分类管理（一级 / 二级）
│       ├── utils/
│       │   ├── supabase.ts            # REST API 封装（wx.request）
│       │   ├── storage.ts             # 会话与复制历史（wx.storage）
│       │   ├── helpers.ts             # 分类树 / 日期格式化 / 复制
│       │   └── types.ts               # Prompt / Category / Session 等
│       └── typings/index.d.ts         # 小程序全局类型
│
├── packages/                          # 共享包目录
│   └── shared/                        # 跨端共享类型定义
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts               # Prompt / Category / Variable 等
│
├── supabase/                          # Supabase 后端配置
│   ├── schema.sql                     # 数据库 Schema（表结构 + RLS）
│   └── functions/
│       └── optimize-prompt/           # AI 优化 Edge Function
│           ├── index.ts
│           └── README.md
│
├── note/                              # 项目级架构文档（本目录）
│   ├── dir.md                         # 目录结构说明
│   ├── arch.mmd                       # 架构图（Mermaid）
│   └── module.mmd                     # 模块依赖图（Mermaid）
│
├── package.json                       # 根 monorepo 配置与脚本
├── pnpm-workspace.yaml                # pnpm 工作区
├── pnpm-lock.yaml
├── README.md
└── .gitignore
```

---

## 文件功能详解

### 根目录配置文件

| 文件 | 功能说明 |
|------|----------|
| `package.json` | 定义 monorepo 工作区，提供 `dev:web`、`dev:desktop`、`dev:mobile`、`dev:extension`、`build:*`、`typecheck:miniprogram` 等脚本 |
| `pnpm-workspace.yaml` | 声明工作区包含 `apps/*` 和 `packages/*` |
| `README.md` | 项目说明、技术栈、快速开始、环境变量配置 |

### Web 应用 (`apps/web/`)

| 模块 | 功能说明 |
|------|----------|
| `contexts/AuthContext.tsx` | 用户认证状态（登录 / 登出 / Google OAuth） |
| `contexts/PromptContext.tsx` | Prompt 增删改查、分类、搜索 |
| `lib/supabase.ts` | Supabase JS Client 初始化 |
| `pages/*` | Dashboard、Login、PromptList、PromptDetail、Settings |

### 桌面端 (`apps/desktop/`)

| 模块 | 功能说明 |
|------|----------|
| `src-tauri/tauri.conf.json` | 开发时加载 `localhost:5173`，生产时使用 `apps/web/dist` |
| `src-tauri/src/` | Rust 后端入口，WebView 壳层 |

### 移动端 (`apps/mobile/`)

| 模块 | 功能说明 |
|------|----------|
| `capacitor.config.ts` | `webDir` 指向 `../web/dist`，复用 Web 构建产物 |
| `android/` | Capacitor 生成的 Android 原生工程 |

### Flutter 移动端 (`apps/flutter/`)

| 模块 | 功能说明 |
|------|----------|
| `main.dart` | 应用入口：加载 `.env`、初始化 Supabase、注入 Provider |
| `app.dart` | `GoRouter` 声明式路由、登录守卫、`MaterialApp` 主题 |
| `config/app_config.dart` | 读取 `SUPABASE_URL` / `SUPABASE_ANON_KEY`，拼接 `optimize-prompt` URL |
| `models/` | `Prompt`、`Category`、`Variable` 数据模型与 JSON 序列化 |
| `providers/auth_provider.dart` | 邮箱登录 / 注册 / 登出，监听 `onAuthStateChange` |
| `providers/prompt_provider.dart` | Prompt 与分类 CRUD、搜索、使用计数 |
| `screens/login_screen.dart` | 登录 / 注册表单页 |
| `screens/dashboard_screen.dart` | 首页仪表盘：统计卡片、最近 Prompt |
| `screens/prompt_list_screen.dart` | 列表、搜索筛选、多选批量操作、复制历史 |
| `screens/prompt_detail_screen.dart` | 新建 / 编辑 Prompt、AI 优化 |
| `screens/categories_screen.dart` | 二级分类管理、拖拽排序 |
| `services/prompt_repository.dart` | Supabase `prompts` / `categories` 表 CRUD |
| `services/ai_service.dart` | 调用 `optimize-prompt` Edge Function |
| `services/copy_history_service.dart` | `SharedPreferences` 本地复制历史（最多 50 条） |
| `android/` / `ios/` | Flutter 原生平台工程 |

Flutter 详细目录见 `apps/flutter/note/dir.md`。

### 浏览器扩展 (`apps/extension/`)

| 模块 | 功能说明 |
|------|----------|
| `manifest.json` | MV3 权限：storage、sidePanel、clipboardWrite、identity、contextMenus、scripting 等 |
| `src/App.tsx` | 侧栏主界面：Prompt 列表、搜索筛选、复制、AI 优化、Supabase 登录 |
| `src/background.ts` | Service Worker：定时同步、右键菜单、消息路由、标签页插入 |
| `src/content/contentScript.ts` | 注入网页：在 ChatGPT 等输入框插入 Prompt、显示 Toast |
| `src/usePromptData.ts` | 聚合 chrome.storage、mock 数据与 Supabase 远程数据 |
| `src/supabase.ts` | Supabase 客户端、远程 CRUD/sync、调用 `optimize-prompt` |
| `src/storage.ts` | `chrome.storage.local` 持久化 prompts / categories / auth |
| `src/syncService.ts` | 后台从 Supabase 拉取并写入本地 storage |
| `src/contextMenus.ts` | 右键菜单：插入 Prompt 到页面、保存选中文本 |
| `src/messaging.ts` | background ↔ content ↔ sidepanel 消息协议 |
| `src/insertPrompt.ts` | 侧栏 UI 触发向当前标签页插入 Prompt |
| `src/tabInsert.ts` | background 执行 scripting 注入 content script |
| `src/promptClipService.ts` | 将页面选中文本保存为新 Prompt |
| `src/runtime.ts` | 读取 `VITE_SUPABASE_URL` 等环境变量 |

扩展详细目录见 `apps/extension/note/dir.md`。

### 微信小程序 (`apps/miniprogram/`)

| 模块 | 功能说明 |
|------|----------|
| `app.json` | 页面路由、tabBar（首页 / Prompt / 分类）、导航栏样式 |
| `app.ts` | 全局 App 实例，启动时恢复会话，`checkAuth()` 守卫 |
| `config/config.ts` | Supabase URL / Anon Key / Function URL |
| `pages/login/` | 邮箱密码登录与注册（不支持 Google OAuth） |
| `pages/index/` | 仪表盘：统计、最近 Prompt、复制历史 |
| `pages/prompts/list/` | 列表、搜索筛选、批量删除、一键复制 |
| `pages/prompts/detail/` | 新建 / 编辑 Prompt、AI 优化 |
| `pages/categories/index/` | 一级 / 二级分类 CRUD |
| `utils/supabase.ts` | 基于 `wx.request` 的 Supabase REST / Auth / Edge Function 封装 |
| `utils/storage.ts` | 本地会话（`wx.setStorageSync`）与复制历史 |
| `utils/helpers.ts` | 分类树构建、日期格式化、剪贴板复制 |
| `utils/types.ts` | 小程序端类型定义（与 shared 结构对齐） |

### 共享包 (`packages/shared/`)

| 文件 | 功能说明 |
|------|----------|
| `src/index.ts` | 导出 `Prompt`、`Category`、`Variable`、`User` 及 Create/Update 输入类型 |

### 后端 (`supabase/`)

| 文件 | 功能说明 |
|------|----------|
| `schema.sql` | `profiles`、`categories`、`prompts` 等表结构与 RLS 策略 |
| `functions/optimize-prompt/index.ts` | Edge Function：调用 DeepSeek 等 API 优化 Prompt 内容 |

---

## 技术架构概览

```
┌──────────────────────────────────────────────────────────────────────┐
│                           客户端（多端）                               │
├──────────────┬──────────────┬──────────────┬──────────────────────────┤
│  apps/web    │ apps/desktop │ apps/mobile  │ apps/extension           │
│  React 18    │ Tauri 2      │ Capacitor 7  │ Chrome MV3 + React       │
│  Vite        │ 封装 web     │ 封装 web     │ 侧栏 / 右键 / 页面插入    │
├──────────────┴──────────────┴──────────────┴──────────────────────────┤
│  apps/flutter              │  apps/miniprogram                        │
│  Flutter 3 + Dart 3        │  微信小程序原生框架 + TypeScript          │
│  Provider + go_router      │  wx.request 调用 Supabase REST           │
│  supabase_flutter          │                                          │
├──────────────────────────────────────────────────────────────────────┤
│  packages/shared    共享类型定义（web 可直接引用；extension/miniprogram/flutter 各自维护对齐副本）│
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                         云端（Supabase）                              │
│  ├── Auth（邮箱密码 / Google OAuth）                                  │
│  ├── PostgreSQL（profiles / categories / prompts）                   │
│  └── Edge Functions（optimize-prompt）                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 脚本命令

| 命令 | 说明 |
|------|------|
| `pnpm dev:web` | 启动 Web 开发服务器 |
| `pnpm build:web` | 构建 Web 生产包 |
| `pnpm dev:desktop` | 启动 Tauri 桌面开发（联动 web dev） |
| `pnpm build:desktop` | 构建桌面安装包 |
| `pnpm dev:mobile` | 移动端开发 |
| `pnpm build:mobile` | 构建 Web 并同步到 Android |
| `pnpm dev:extension` | 扩展 Vite 开发构建 |
| `pnpm build:extension` | 扩展生产构建 → `apps/extension/dist` |
| `pnpm typecheck:miniprogram` | 小程序 TypeScript 类型检查 |
| `pnpm dev:flutter` | 启动 Flutter 开发（`flutter run`） |
| `pnpm build:flutter:apk` | 构建 Flutter Android Release APK |

---

## 环境变量与配置

| 端 | 配置位置 | 关键变量 |
|----|----------|----------|
| Web / Desktop / Mobile | `apps/web/.env` | `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` |
| Extension | `apps/extension/.env` | `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_SUPABASE_FUNCTION_URL`（可选） |
| Miniprogram | `apps/miniprogram/config/config.ts` | `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_FUNCTION_URL` |
| Flutter | `apps/flutter/.env` | `SUPABASE_URL`、`SUPABASE_ANON_KEY` |

微信小程序还需在微信公众平台配置 Supabase 域名为 request 合法域名。
