# optimize-prompt Edge Function

将用户 Prompt 发送至 DeepSeek 进行优化，供 Web / 小程序 / 浏览器插件共用。

## 环境变量（Supabase Secrets）

在 Supabase Dashboard → Project Settings → Edge Functions → Secrets，或通过 CLI 设置：

| 变量 | 必填 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 是 | [DeepSeek 开放平台](https://platform.deepseek.com/) 申请的 API Key |
| `DEEPSEEK_MODEL` | 否 | 默认 `deepseek-chat`，可改为 `deepseek-v4-flash` 等 |
| `DEEPSEEK_API_URL` | 否 | 默认 `https://api.deepseek.com/chat/completions` |

`SUPABASE_URL` 与 `SUPABASE_ANON_KEY` 由 Supabase 在部署时自动注入，无需手动配置。

## 部署

```bash
# 在项目根目录，已 link 到 Supabase 项目后
npx supabase secrets set DEEPSEEK_API_KEY=sk-xxxxxxxx

npx supabase functions deploy optimize-prompt
```

## 请求格式

```http
POST /functions/v1/optimize-prompt
Authorization: Bearer <用户 access_token>
Content-Type: application/json

{
  "content": "原始 Prompt 文本",
  "instruction": "可选：更简洁、面向翻译场景等"
}
```

## 响应

成功：`{ "optimized": "优化后的文本" }`

失败：`{ "error": "说明" }`（HTTP 4xx/5xx）
