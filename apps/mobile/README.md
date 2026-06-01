# Prompt Manager 移动端

基于 Capacitor 7 封装 Web 应用为 Android/iOS 原生应用，复用 `apps/web` 的全部前端代码。

## 前置要求

- **Node.js** 18+
- **Android**: [Android Studio](https://developer.android.com/studio) + JDK 17+
- **iOS** (macOS only): Xcode 15+

## 开发

### 1. 配置环境变量

确保 `apps/web/.env` 已配置 Supabase 环境变量。

### 2. 构建 Web 并同步

```bash
# 构建 Web 应用并同步到 Android 项目
pnpm build:mobile
```

### 3. 打开 Android Studio

```bash
pnpm --filter mobile open:android
```

在 Android Studio 中运行到模拟器或真机。

### 4. 实时开发 (Live Reload)

修改 `capacitor.config.ts` 临时启用开发服务器：

```typescript
server: {
  url: 'http://<你的局域网IP>:5173',
  cleartext: true,
}
```

然后运行 `pnpm dev:web` 和 `pnpm --filter mobile run:android`。

## 打包 APK

```bash
# 1. 构建 Web + 同步
pnpm build:mobile

# 2. 在 Android Studio 中: Build > Build Bundle(s) / APK(s) > Build APK(s)
# 或使用命令行:
cd apps/mobile/android
./gradlew assembleDebug   # Debug APK
./gradlew assembleRelease # Release APK (需签名配置)
```

APK 输出路径: `apps/mobile/android/app/build/outputs/apk/`

## 项目结构

```
apps/mobile/
├── package.json
├── capacitor.config.ts   # webDir 指向 ../web/dist
└── android/              # Android 原生项目 (cap add android 生成)
```
