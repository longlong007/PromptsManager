# `apps/extension` 目录说明

以下为与 `tree` 类似的目录结构及文件职责说明。**`dist/` 与 `*.tsbuildinfo` 随构建生成，资源文件名中的 hash 可能每次构建不同。**

```
apps/extension/
├── README.md
├── manifest.json          # Manifest V3 源文件（构建时拷贝到 dist）
├── package.json
├── tsconfig.json
├── vite.config.ts
├── popup.html             # 扩展工具栏弹出页入口 HTML
├── sidepanel.html         # 侧边栏入口 HTML
├── options.html           # 选项页入口 HTML
├── dist/                  # `pnpm build` 输出目录，用于「加载未打包扩展」
│   ├── manifest.json
│   ├── popup.html
│   ├── sidepanel.html
│   ├── options.html
│   └── assets/
│       ├── main-*.js      # 打包后的应用脚本（文件名带 content hash）
│       └── main-*.css     # 打包后的样式（文件名带 content hash）
└── src/
    ├── main.tsx           # React 挂载入口，挂载 `App`，引入全局样式
    ├── App.tsx            # 主 UI：Prompt 列表、搜索/筛选、复制、AI 优化、Supabase 登录等
    ├── styles.css         # 扩展页面全局样式
    ├── runtime.ts         # 读取 `import.meta.env` 的 Supabase / Edge Function URL 等运行时配置
    ├── supabase.ts        # Supabase 客户端、`optimizePromptWithAI` 及远程 CRUD/sync 封装
    ├── usePromptData.ts   # 聚合本地 storage、mock、与 Supabase 的 Prompt/分类/登录状态钩子
    ├── storage.ts         # `chrome.storage.local` 读写 prompts、categories、auth
    ├── store.ts           # Zustand 全局状态（可复用扩展状态）
    ├── types.ts           # `Prompt`、`Category`、`PromptFilters`、`AuthState` 等类型定义
    ├── mockData.ts        # 初次无本地数据时的示例 Prompts / 分类种子数据
    ├── browser.ts         # 检测是否在具备 `chrome.storage` 的扩展环境中
    ├── manifest.ts        # 与根目录 `manifest.json` 对齐的常量对象（TypeScript）
    └── extension.d.ts     # Chrome / Vite 客户端类型：`chrome`、`vite/client`

# 构建与工具链可能生成的文件（非必须手写维护）

├── tsconfig.tsbuildinfo   # TypeScript 增量编译缓存（`tsc -b` 可能生成）
```

## `note/` 目录

| 文件      | 作用                         |
|-----------|------------------------------|
| `dir.md`  | 本说明：扩展包目录结构与职责 |

## 脚本与环境（摘自 `package.json` / `README.md`）

| 脚本 | 作用 |
|------|------|
| `pnpm dev` / `pnpm --filter extension dev` | `vite` 开发构建 |
| `pnpm build` | `tsc -b && vite build`，输出到 `dist/` |

推荐环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`；可选 `VITE_SUPABASE_FUNCTION_URL`（详见仓库内 `README.md`）。

## 多端 HTML 共用同一 SPA

`popup.html`、`sidepanel.html`、`options.html` 均加载同一套 `main.tsx`，与根目录 `manifest.json` 中的 `default_popup`、`side_panel.default_path`、`options_page` 对应；Vite `build.rollupOptions.input` 配置多入口，分别产出各 HTML 到 `dist/`。
