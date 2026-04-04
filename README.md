# Prompt Manager - AI提示词管理器

一款跨平台的AI提示词管理应用，支持Web、桌面端、移动端和微信小程序。

## 技术栈

| 层级 | 技术方案 |
|------|----------|
| 前端框架 | React 18 + TypeScript |
| 跨端方案 | Tauri 2.x (桌面) + Capacitor (移动端) |
| 样式方案 | Tailwind CSS |
| 云端服务 | Supabase (认证 + PostgreSQL数据库) |
| 状态管理 | React Context |
| AI API | OpenAI GPT / Google Gemini |

## 功能特性

- [x] 增删改查 Prompt
- [x] 分类管理（二级分类）
- [x] 标签管理
- [x] 全文搜索 + 分类筛选
- [x] 一键复制
- [x] AI 优化 Prompt
- [ ] Tauri 桌面端
- [ ] Capacitor 移动端
- [ ] 微信小程序

## 快速开始

### 1. 配置 Supabase

1. 创建 [Supabase](https://supabase.com) 项目
2. 在 SQL Editor 中运行 `supabase/schema.sql` 文件
3. 复制 `.env.example` 为 `.env` 并填入你的 Supabase URL 和 Anon Key

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev:web
```

### 4. 构建生产版本

```bash
pnpm build:web
```

## 项目结构

```
prompt-manager/
├── apps/
│   ├── web/                 # Web应用
│   ├── desktop/            # Tauri桌面端 (待实现)
│   ├── mobile/             # Capacitor移动端 (待实现)
│   └── miniprogram/         # 微信小程序 (待实现)
├── packages/
│   └── shared/              # 共享类型定义
├── supabase/
│   └── schema.sql          # 数据库Schema
└── README.md
```

## 环境变量

在 `apps/web/` 目录下创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 后续开发

1. **Tauri桌面端** - 使用 Tauri 封装 Web 应用为桌面应用
2. **Capacitor移动端** - 使用 Capacitor 封装为 iOS/Android 应用
3. **微信小程序** - 使用微信原生开发小程序版本

## License

MIT
