# AI Prompt Manager — VS Code / Cursor 扩展

活动栏侧栏 Webview + React，UI 与 `apps/extension` 浏览器扩展侧栏一致；数据经 Supabase 与 Web / 小程序 / 浏览器扩展同步。

## 功能

- 邮箱登录 / 注册（与云端同一账号）
- Prompt 列表、搜索、分类/标签筛选
- 详情：复制、**插入到当前编辑器光标**、编辑、删除、AI 优化
- 命令面板：`Prompt Manager: Insert Prompt at Cursor`（Quick Pick）
- 命令面板：`Prompt Manager: Open Sidebar`

## 开发

### 1. 安装依赖（仓库根目录）

```bash
pnpm install
```

### 2. 编译

```bash
pnpm --filter ide-extension compile
```

可选：在 `apps/ide-extension` 下复制 `.env.example` 为 `.env`，配置 `VITE_SUPABASE_*`（未配置时使用与浏览器扩展相同的内置默认项目）。

### 3. 调试

用 VS Code 或 Cursor 打开 **`apps/ide-extension`** 文件夹（作为扩展开发根目录），按 **F5** 启动 Extension Development Host。

**Windows 若 F5 报 `pnpm.ps1 禁止运行脚本`：** 已在 `.vscode/tasks.json` 里让 compile 任务走 `cmd.exe` 调用 `pnpm.cmd`。也可在 PowerShell（管理员）执行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 后重试 F5。

**若输出里出现 `drcika.apc-extension` / `Cannot read properties of undefined (reading 'filename')`：** 这是本机已安装的 APC 类扩展在开发主机里激活失败，与 Prompt Manager 无关。`launch.json` 已加 `--disable-extensions`，F5 时会只加载正在开发的扩展。

**Webview 开发者工具里大量 `workbench.desktop.main.js` / Copilot / Python 的 WARN：** 来自 Cursor 本体或其它扩展，可忽略。只要看到 `[APM-IDE][ui] IDE 侧栏 UI 已挂载` 即表示本扩展前端已加载。`no composite descriptor found for workbench.view.extension.promptManager` 多为首次打开侧栏时的时序警告，重载窗口或再点一次活动栏图标即可。

在宿主窗口左侧活动栏打开 **Prompt Manager** 图标 → **Prompts** 视图。

### 4. 打包 .vsix

```bash
pnpm --filter ide-extension package
```

## 项目结构

```
apps/ide-extension/
├── package.json          # 扩展 manifest + 脚本
├── src/
│   ├── extension.ts      # 激活、注册侧栏
│   └── promptSidebarProvider.ts  # Webview HTML + 插入编辑器
├── webview/              # React 侧栏（Vite → dist/webview）
│   └── src/App.tsx       # 与浏览器扩展侧栏同款布局
├── dist/
│   ├── extension.js      # 扩展宿主
│   └── webview/          # 构建后的静态资源
└── media/icon.svg
```

## 与浏览器扩展的差异

| 能力 | 浏览器扩展 | IDE 扩展 |
|------|------------|----------|
| 插入目标 | 网页输入框（content script） | 当前编辑器光标 |
| 存储 | `chrome.storage` | Webview `localStorage` |
| Google 登录 | `chrome.identity` | 暂仅邮箱（按钮会提示） |

## 发布

使用 `@vscode/vsce package` 生成 `.vsix`，可：

- 在 Cursor / VS Code 中「从 VSIX 安装扩展」
- 或发布到 [Open VSX](https://open-vsx.org/) / Visual Studio Marketplace
