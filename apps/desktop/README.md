# Prompt Manager 桌面端

基于 Tauri 2 封装 Web 应用为跨平台桌面应用，复用 `apps/web` 的全部前端代码。

## 前置要求

安装 [Tauri 前置依赖](https://v2.tauri.app/start/prerequisites/)：

- **Windows**: Visual Studio Build Tools (含 C++ 工作负载)、WebView2
- **Rust**: 通过 [rustup](https://rustup.rs/) 安装

```bash
# 安装 Rust (Windows/macOS/Linux)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## 开发

确保 `apps/web/.env` 已配置 Supabase 环境变量，然后：

```bash
# 在项目根目录
pnpm dev:desktop
```

该命令会：
1. 启动 Web 开发服务器 (localhost:5173)
2. 打开 Tauri 桌面窗口并加载 Web 应用

## 构建

```bash
pnpm build:desktop
```

构建产物位于 `apps/desktop/src-tauri/target/release/bundle/`。

## 项目结构

```
apps/desktop/
├── package.json          # Tauri CLI 脚本
└── src-tauri/            # Rust 后端
    ├── Cargo.toml
    ├── tauri.conf.json   # 指向 apps/web 构建产物
    ├── capabilities/
    └── icons/
```

## 配置说明

`tauri.conf.json` 中的关键配置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `beforeDevCommand` | `pnpm --filter web dev` | 开发时启动 Web 服务 |
| `beforeBuildCommand` | `pnpm --filter web build` | 构建前先编译 Web |
| `devUrl` | `http://localhost:5173` | 开发模式 WebView 地址 |
| `frontendDist` | `../../web/dist` | 生产构建静态资源路径 |
