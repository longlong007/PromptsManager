# `apps/flutter` 目录说明

Flutter 原生移动端（Android / iOS），与 Web / 小程序共用同一 Supabase 后端，同一账号登录后 Prompt 与分类数据云端同步。

```
apps/flutter/
├── README.md
├── pubspec.yaml               # Dart 依赖、SDK 版本、资源声明
├── pubspec.lock               # 依赖锁定（自动生成）
├── analysis_options.yaml      # Dart / Flutter Lint 规则
├── .metadata                  # Flutter 项目元数据（自动生成）
├── .env.example               # 环境变量模板
├── .env                       # 实际配置（gitignore，需手动创建）
├── docs/
│   ├── flutter_arch.svg           # 分层架构图（由 scripts 生成）
│   └── flutter_module_deps.svg    # 模块依赖图（由 scripts 生成）
├── scripts/
│   ├── gen_flutter_arch_svg.py        # 架构 SVG 生成脚本
│   └── gen_flutter_module_deps_svg.py # 模块依赖 SVG 生成脚本
├── note/                      # Flutter 子文档
│   ├── dir.md                 # 本说明
│   ├── arch.mmd               # 架构图（Mermaid）
│   └── module.mmd             # 模块依赖图
├── lib/
│   ├── main.dart              # 应用入口
│   ├── app.dart               # GoRouter 路由 + MaterialApp 主题
│   ├── config/
│   │   └── app_config.dart    # 读取 .env，判断配置是否有效
│   ├── models/
│   │   ├── prompt.dart        # Prompt 实体（fromJson / toInsertJson）
│   │   ├── category.dart      # 分类实体（支持 parent_id 二级分类）
│   │   └── variable.dart      # Prompt 变量占位符
│   ├── providers/
│   │   ├── auth_provider.dart # 认证状态（ChangeNotifier）
│   │   └── prompt_provider.dart # Prompt + 分类业务状态
│   ├── screens/
│   │   ├── login_screen.dart       # 登录 / 注册
│   │   ├── dashboard_screen.dart   # 首页仪表盘
│   │   ├── prompt_list_screen.dart # Prompt 列表
│   │   ├── prompt_detail_screen.dart # 新建 / 编辑 / AI 优化
│   │   └── categories_screen.dart  # 分类管理
│   └── services/
│       ├── prompt_repository.dart  # Supabase CRUD
│       ├── ai_service.dart         # optimize-prompt Edge Function
│       └── copy_history_service.dart # SharedPreferences 复制历史
├── test/
│   └── widget_test.dart       # Widget 测试占位
├── android/                   # Android 原生工程
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── kotlin/.../MainActivity.kt
│   ├── build.gradle.kts
│   └── settings.gradle.kts
└── ios/                       # iOS 原生工程（需 macOS + Xcode）
    ├── Runner/
    │   ├── AppDelegate.swift
    │   ├── Info.plist
    │   └── Assets.xcassets/
    └── Runner.xcodeproj/
```

## `lib/` 各文件职责

| 文件 | 职责 |
|------|------|
| `main.dart` | `WidgetsFlutterBinding`、加载 `.env`、初始化 Supabase、`MultiProvider` 注入、`runApp` |
| `app.dart` | `createRouter()` 定义路由与登录守卫；`PromptManagerApp` 配置 Material 3 主题 |
| `config/app_config.dart` | 从 `flutter_dotenv` 读取 `SUPABASE_URL` / `SUPABASE_ANON_KEY`，拼接 Edge Function URL |
| `models/prompt.dart` | 对应 `prompts` 表字段，含 `tags`、`variables`（JSONB）解析 |
| `models/category.dart` | 对应 `categories` 表，`parentId` 实现二级分类，`copyWith` 局部更新 |
| `models/variable.dart` | Prompt 内嵌变量：`name`、`description`、`defaultValue` |
| `providers/auth_provider.dart` | `signIn` / `signUp` / `signOut`，监听 `onAuthStateChange`，供 GoRouter `refreshListenable` |
| `providers/prompt_provider.dart` | 封装 Repository 调用，`loadAll` / `search` / CRUD / `incrementUsage` / 分类排序 |
| `screens/login_screen.dart` | 邮箱密码表单，登录 / 注册切换 |
| `screens/dashboard_screen.dart` | 统计卡片、最近 5 条 Prompt、下拉刷新、退出登录 |
| `screens/prompt_list_screen.dart` | 搜索、分类筛选、多选批量复制/删除、复制历史 BottomSheet |
| `screens/prompt_detail_screen.dart` | 标题 / 分类 / 标签 / 内容表单，AI 优化，保存后跳转列表 |
| `screens/categories_screen.dart` | 分类 CRUD 对话框、`ReorderableListView` 拖拽排序 |
| `services/prompt_repository.dart` | 直接调用 `Supabase.instance.client`，按 `user_id` 过滤数据 |
| `services/ai_service.dart` | `client.functions.invoke('optimize-prompt')` |
| `services/copy_history_service.dart` | JSON 序列化写入 `SharedPreferences`，最多保留 50 条 |

## 路由表

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | `LoginScreen` | 未登录时强制跳转 |
| `/` | `DashboardScreen` | 首页仪表盘 |
| `/prompts` | `PromptListScreen` | Prompt 列表 |
| `/prompts/:id` | `PromptDetailScreen` | `id=new` 为新建，否则编辑 |
| `/categories` | `CategoriesScreen` | 分类管理 |

## 脚本与环境

| 命令 | 说明 |
|------|------|
| `pnpm dev:flutter` | 根目录快捷命令 → `cd apps/flutter && flutter run` |
| `pnpm build:flutter:apk` | 构建 Android Release APK |
| `flutter pub get` | 安装 Dart 依赖 |
| `flutter run -d android` | 指定 Android 设备 |
| `flutter run -d ios` | 指定 iOS 模拟器（需 macOS） |
| `flutter build appbundle --release` | 构建 Android App Bundle |

环境变量（`apps/flutter/.env`）：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

`.env` 已在 `pubspec.yaml` 的 `assets` 中声明，由 `flutter_dotenv` 在启动时加载。

## 与 Monorepo 其他端的关系

| 对比项 | Flutter (`apps/flutter`) | Capacitor (`apps/mobile`) | Web (`apps/web`) |
|--------|--------------------------|---------------------------|------------------|
| 实现方式 | Flutter 原生 UI | WebView 封装 React | React SPA |
| 状态管理 | Provider | React Context | React Context |
| 路由 | go_router | React Router | React Router |
| 后端 SDK | supabase_flutter | supabase-js | supabase-js |
| 本地存储 | SharedPreferences | localStorage | localStorage |
| 包管理 | pub（独立） | pnpm workspace | pnpm workspace |

Flutter 端 **不依赖** `packages/shared`，在 `lib/models/` 中独立维护与数据库对齐的 Dart 类型。
