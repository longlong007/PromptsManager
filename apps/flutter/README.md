# Prompt Manager - Flutter 移动端

基于 Flutter 的 AI 提示词管理器，支持 **Android** 与 **iOS**，与 Web / 桌面端共用 Supabase 后端。

## 功能

- 用户认证（邮箱登录 / 注册）
- Prompt 增删改查
- 分类管理（二级分类、拖拽排序）
- 全文搜索与分类筛选
- 一键复制、批量复制、复制历史
- AI 优化 Prompt（Supabase Edge Function + DeepSeek）

## 环境要求

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+
- Android Studio（Android）或 Xcode（iOS）
- 已配置的 Supabase 项目（见仓库根目录 README）

## 配置

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 编辑 `.env`，填入 Supabase 配置：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

3. 确保已在 Supabase 执行 `supabase/schema.sql`，并部署 `optimize-prompt` Edge Function。

## 运行

```bash
cd apps/flutter
flutter pub get
flutter run
```

指定平台：

```bash
flutter run -d android
flutter run -d ios
```

## 构建发布包

```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS（需 macOS + Xcode）
flutter build ios --release
```

## 项目结构

```
apps/flutter/
├── lib/
│   ├── config/          # 环境配置
│   ├── models/          # 数据模型
│   ├── providers/       # 状态管理
│   ├── screens/         # 页面
│   ├── services/        # Supabase / AI / 复制历史
│   ├── app.dart         # 路由与应用壳
│   └── main.dart
├── note/                # 架构文档（arch / dir / module）
├── android/
├── ios/
├── .env.example
└── pubspec.yaml
```

详细目录与架构说明见 `note/dir.md`、`note/arch.mmd`、`note/module.mmd`。

- 分层架构图：`docs/flutter_arch.svg`（`python scripts/gen_flutter_arch_svg.py`）
- 模块依赖图：`docs/flutter_module_deps.svg`（`python scripts/gen_flutter_module_deps_svg.py`）

## 与 Web 端数据同步

Flutter 应用与 `apps/web` 使用同一 Supabase 项目，登录同一账号后 Prompt 与分类数据自动云端同步。
