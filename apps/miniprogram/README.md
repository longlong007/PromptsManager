# Prompt Manager 微信小程序

与 Web 端共用 Supabase 后端，实现 Prompt CRUD、分类管理、搜索筛选、一键复制、批量操作、复制历史与 AI 优化（Edge Function）。

## 功能对照

| 功能 | 说明 |
|------|------|
| 用户认证 | 邮箱密码登录 / 注册（与 Web 相同 Supabase Auth） |
| Prompt CRUD | 列表、新建、编辑、删除、批量删除 |
| 分类管理 | 一级 / 二级分类、排序、编辑、删除 |
| 搜索筛选 | 标题 / 内容 / 标签搜索，按分类筛选 |
| 一键复制 | 单条复制、批量复制、复制历史（本地存储） |
| AI 优化 | 调用 `optimize-prompt` Edge Function |

## 快速开始

### 1. 配置 Supabase

```bash
cp config/config.example.ts config/config.ts
```

在 `config/config.ts` 填入与 `apps/web` 相同的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。

### 2. 配置微信 AppID

复制 `project.private.config.example.json` 为 `project.private.config.json`，填入你的小程序 AppID。

或在微信开发者工具中直接修改 `project.config.json` 的 `appid`。

### 3. 域名白名单

在微信公众平台 → 开发管理 → 开发设置 → 服务器域名，添加：

- **request 合法域名**：`https://<your-project>.supabase.co`

### 4. 打开项目

1. 安装依赖（可选，用于 TypeScript 类型检查）：

   ```bash
   cd apps/miniprogram && pnpm install
   ```

2. 用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 导入目录：`apps/miniprogram`

3. 编译并预览；首次使用需先登录

## 项目结构

```
apps/miniprogram/
├── app.json              # 全局配置与 tabBar
├── app.ts / app.wxss
├── config/               # Supabase 配置
├── pages/
│   ├── login/            # 登录注册
│   ├── index/            # 首页仪表盘
│   ├── prompts/list/     # Prompt 列表
│   ├── prompts/detail/   # 新建 / 编辑
│   └── categories/       # 分类管理
└── utils/
    ├── supabase.ts       # REST API 封装
    ├── storage.ts        # 会话与复制历史
    └── helpers.ts
```

## 说明

- 微信小程序不支持 Google OAuth，仅提供邮箱密码登录。
- AI 优化依赖已部署的 Supabase Edge Function；若函数返回 410，需在后端重新启用优化逻辑。
- `touristappid` 仅用于本地调试，正式发布请使用真实 AppID。
