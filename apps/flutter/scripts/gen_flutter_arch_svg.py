"""apps/flutter/scripts/gen_flutter_arch_svg.py — Flutter 应用架构 SVG 生成器."""
from pathlib import Path

SVG = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 960"
     font-family="-apple-system, 'PingFang SC', 'Microsoft YaHei', Helvetica, sans-serif">
  <defs>
    <style><![CDATA[
      .title       { font-size: 22px; font-weight: 700; fill: #0f172a; }
      .subtitle    { font-size: 13px; fill: #475569; }
      .layer-label { font-size: 13px; font-weight: 700; fill: #475569; letter-spacing: 2px; }
      .module-name { font-size: 13px; font-weight: 700; fill: #0f172a; }
      .module-en   { font-size: 9.5px; fill: #64748b; font-family: Consolas, 'Courier New', monospace; }
      .module-desc { font-size: 11px; fill: #334155; }
      .infra-name  { font-size: 13px; font-weight: 700; fill: #0f172a; }
      .infra-en    { font-size: 9.5px; fill: #64748b; font-family: Consolas, 'Courier New', monospace; }
      .infra-desc  { font-size: 11px; fill: #475569; }
      .arrow-label { font-size: 10.5px; fill: #64748b; font-style: italic; }
      .ext-name    { font-size: 12px; font-weight: 700; fill: #44403c; }
      .ext-en      { font-size: 9.5px; fill: #78716c; font-family: Consolas, 'Courier New', monospace; }
      .ext-desc    { font-size: 10.5px; fill: #57534e; }
    ]]></style>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
    </marker>
    <marker id="arrow-ext" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <!-- 背景 -->
  <rect width="1500" height="960" fill="#ffffff"/>

  <!-- 标题 -->
  <text x="750" y="38" text-anchor="middle" class="title">Prompt Manager Flutter · 架构图</text>
  <text x="750" y="60" text-anchor="middle" class="subtitle">面向移动端的 AI 提示词管理应用 · 支持增删改查、分类、搜索、复制与智能优化</text>

  <!-- ═══════════ 左侧周边支撑 ═══════════ -->
  <rect x="20" y="90" width="160" height="790" rx="10" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="100" y="118" text-anchor="middle" class="layer-label">周边支撑</text>

  <rect x="32" y="140" width="136" height="108" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <text x="44" y="160" class="infra-name">环境配置</text>
  <text x="44" y="174" class="infra-en">AppConfig · app_config.dart</text>
  <text x="44" y="192" class="infra-desc">读取连接密钥</text>
  <text x="44" y="208" class="infra-desc">校验配置有效性</text>
  <text x="44" y="224" class="infra-desc">拼接优化接口地址</text>

  <rect x="32" y="264" width="136" height="120" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <text x="44" y="284" class="infra-name">数据模型</text>
  <text x="44" y="298" class="infra-en">models · Prompt Category Variable</text>
  <text x="44" y="316" class="infra-desc">提示词实体定义</text>
  <text x="44" y="332" class="infra-desc">分类与变量结构</text>
  <text x="44" y="348" class="infra-desc">云端 JSON 映射</text>

  <rect x="32" y="400" width="136" height="96" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <text x="44" y="420" class="infra-name">平台工程</text>
  <text x="44" y="434" class="infra-en">android · ios</text>
  <text x="44" y="452" class="infra-desc">Android 原生壳</text>
  <text x="44" y="468" class="infra-desc">iOS 原生壳</text>
  <text x="44" y="484" class="infra-desc">双端打包发布</text>

  <rect x="32" y="512" width="136" height="88" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <text x="44" y="532" class="infra-name">应用入口</text>
  <text x="44" y="546" class="infra-en">main.dart</text>
  <text x="44" y="564" class="infra-desc">初始化环境与状态</text>
  <text x="44" y="580" class="infra-desc">注入全局 Provider</text>

  <!-- ═══════════ 主脊柱 ═══════════ -->
  <g transform="translate(160, 0)">

    <!-- ① 页面层 -->
    <rect x="40" y="90" width="1100" height="168" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="60" y="118" class="layer-label">① 页面层 · screens · 用户交互入口</text>

    <rect x="60" y="132" width="196" height="110" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
    <text x="72" y="150" class="module-name">登录注册页</text>
    <text x="72" y="164" class="module-en">LoginScreen · login_screen.dart</text>
    <text x="72" y="182" class="module-desc">邮箱密码登录</text>
    <text x="72" y="198" class="module-desc">新用户注册</text>
    <text x="72" y="214" class="module-desc">表单校验反馈</text>

    <rect x="272" y="132" width="196" height="110" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
    <text x="284" y="150" class="module-name">首页仪表盘</text>
    <text x="284" y="164" class="module-en">DashboardScreen · dashboard_screen.dart</text>
    <text x="284" y="182" class="module-desc">统计卡片展示</text>
    <text x="284" y="198" class="module-desc">最近提示词预览</text>
    <text x="284" y="214" class="module-desc">快捷创建入口</text>

    <rect x="484" y="132" width="196" height="110" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
    <text x="496" y="150" class="module-name">提示词列表</text>
    <text x="496" y="164" class="module-en">PromptListScreen · prompt_list_screen.dart</text>
    <text x="496" y="182" class="module-desc">全文搜索筛选</text>
    <text x="496" y="198" class="module-desc">多选批量操作</text>
    <text x="496" y="214" class="module-desc">一键复制内容</text>

    <rect x="696" y="132" width="196" height="110" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
    <text x="708" y="150" class="module-name">提示词详情</text>
    <text x="708" y="164" class="module-en">PromptDetailScreen · prompt_detail_screen.dart</text>
    <text x="708" y="182" class="module-desc">新建与编辑</text>
    <text x="708" y="198" class="module-desc">标签分类绑定</text>
    <text x="708" y="214" class="module-desc">智能优化内容</text>

    <rect x="908" y="132" width="196" height="110" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
    <text x="920" y="150" class="module-name">分类管理页</text>
    <text x="920" y="164" class="module-en">CategoriesScreen · categories_screen.dart</text>
    <text x="920" y="182" class="module-desc">二级分类维护</text>
    <text x="920" y="198" class="module-desc">拖拽调整顺序</text>
    <text x="920" y="214" class="module-desc">增删改分类</text>

    <!-- 箭头 ①→② -->
    <line x1="590" y1="258" x2="590" y2="292" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="600" y="282" class="arrow-label">用户操作</text>

    <!-- ② 应用壳层 -->
    <rect x="40" y="294" width="1100" height="138" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="322" class="layer-label">② 应用壳层 · app.dart · 导航与全局能力</text>

    <rect x="120" y="336" width="280" height="82" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
    <text x="132" y="354" class="module-name">路由导航</text>
    <text x="132" y="368" class="module-en">GoRouter · createRouter()</text>
    <text x="132" y="386" class="module-desc">声明式页面跳转</text>
    <text x="132" y="402" class="module-desc">参数化详情路由</text>

    <rect x="450" y="336" width="280" height="82" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
    <text x="462" y="354" class="module-name">登录守卫</text>
    <text x="462" y="368" class="module-en">redirect · refreshListenable</text>
    <text x="462" y="386" class="module-desc">会话状态监听</text>
    <text x="462" y="402" class="module-desc">未登录自动重定向</text>

    <rect x="780" y="336" width="280" height="82" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
    <text x="792" y="354" class="module-name">全局主题</text>
    <text x="792" y="368" class="module-en">PromptManagerApp · MaterialApp</text>
    <text x="792" y="386" class="module-desc">统一视觉风格</text>
    <text x="792" y="402" class="module-desc">表单与卡片规范</text>

    <!-- 箭头 ②→③ -->
    <line x1="590" y1="432" x2="590" y2="468" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="600" y="458" class="arrow-label">状态调度</text>

    <!-- ③ 状态与服务层 -->
    <rect x="40" y="470" width="1100" height="218" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="498" class="layer-label">③ 状态与服务层 · providers · services · 业务核心</text>

    <rect x="60" y="512" width="196" height="110" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
    <text x="72" y="530" class="module-name">认证状态</text>
    <text x="72" y="544" class="module-en">AuthProvider · auth_provider.dart</text>
    <text x="72" y="562" class="module-desc">登录会话管理</text>
    <text x="72" y="578" class="module-desc">状态变更通知</text>
    <text x="72" y="594" class="module-desc">登出清理会话</text>

    <rect x="272" y="512" width="196" height="110" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
    <text x="284" y="530" class="module-name">业务状态</text>
    <text x="284" y="544" class="module-en">PromptProvider · prompt_provider.dart</text>
    <text x="284" y="562" class="module-desc">提示词列表缓存</text>
    <text x="284" y="578" class="module-desc">分类树聚合</text>
    <text x="284" y="594" class="module-desc">加载与错误状态</text>

    <rect x="484" y="512" width="196" height="110" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
    <text x="496" y="530" class="module-name">数据仓储</text>
    <text x="496" y="544" class="module-en">PromptRepository · prompt_repository.dart</text>
    <text x="496" y="562" class="module-desc">云端增删改查</text>
    <text x="496" y="578" class="module-desc">条件搜索过滤</text>
    <text x="496" y="594" class="module-desc">使用次数统计</text>

    <rect x="696" y="512" width="196" height="110" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
    <text x="708" y="530" class="module-name">智能优化</text>
    <text x="708" y="544" class="module-en">AiService · ai_service.dart</text>
    <text x="708" y="562" class="module-desc">提交待优化内容</text>
    <text x="708" y="578" class="module-desc">接收优化结果</text>
    <text x="708" y="594" class="module-desc">错误友好提示</text>

    <rect x="908" y="512" width="196" height="110" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1"/>
    <text x="920" y="530" class="module-name">复制历史</text>
    <text x="920" y="544" class="module-en">CopyHistoryService · copy_history_service.dart</text>
    <text x="920" y="562" class="module-desc">记录最近复制</text>
    <text x="920" y="578" class="module-desc">最多保留五十条</text>
    <text x="920" y="594" class="module-desc">支持再次复制</text>

    <!-- 第二行核心卡片 -->
    <rect x="272" y="634" width="360" height="28" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1"/>
    <text x="452" y="653" text-anchor="middle" class="module-desc">screens 经 Provider 读写 · 不直接访问持久化</text>

    <!-- 箭头 ③→④ -->
    <line x1="590" y1="688" x2="590" y2="724" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="600" y="714" class="arrow-label">读写持久化</text>

    <!-- ④ 持久化层 -->
    <rect x="40" y="726" width="1100" height="138" rx="10" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
    <text x="60" y="754" class="layer-label">④ 持久化层 · 数据落地</text>

    <rect x="120" y="768" width="280" height="82" rx="8" fill="#ffffff" stroke="#ec4899" stroke-width="1"/>
    <text x="132" y="786" class="module-name">云端主库</text>
    <text x="132" y="800" class="module-en">Supabase · prompts · categories</text>
    <text x="132" y="818" class="module-desc">提示词表存储</text>
    <text x="132" y="834" class="module-desc">分类表存储</text>

    <rect x="450" y="768" width="280" height="82" rx="8" fill="#ffffff" stroke="#ec4899" stroke-width="1"/>
    <text x="462" y="786" class="module-name">本地历史</text>
    <text x="462" y="800" class="module-en">SharedPreferences · copy_history</text>
    <text x="462" y="818" class="module-desc">设备级复制记录</text>
    <text x="462" y="834" class="module-desc">离线可查看历史</text>

    <rect x="780" y="768" width="280" height="82" rx="8" fill="#ffffff" stroke="#ec4899" stroke-width="1"/>
    <text x="792" y="786" class="module-name">优化接口</text>
    <text x="792" y="800" class="module-en">optimize-prompt · Edge Function</text>
    <text x="792" y="818" class="module-desc">服务端智能处理</text>
    <text x="792" y="834" class="module-desc">返回优化后文本</text>

  </g>

  <!-- ═══════════ 右侧外部依赖 ═══════════ -->
  <rect x="1320" y="90" width="160" height="790" rx="10" fill="#fafaf9" stroke="#a8a29e" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="1400" y="118" text-anchor="middle" class="layer-label">外部服务</text>

  <rect x="1332" y="200" width="136" height="96" rx="8" fill="#ffffff" stroke="#a8a29e" stroke-width="1"/>
  <text x="1344" y="220" class="ext-name">用户认证</text>
  <text x="1344" y="234" class="ext-en">Supabase Auth</text>
  <text x="1344" y="252" class="ext-desc">邮箱密码鉴权</text>
  <text x="1344" y="268" class="ext-desc">会话令牌签发</text>
  <text x="1344" y="284" class="ext-desc">多设备同步登录</text>

  <rect x="1332" y="380" width="136" height="96" rx="8" fill="#ffffff" stroke="#a8a29e" stroke-width="1"/>
  <text x="1344" y="400" class="ext-name">关系型数据库</text>
  <text x="1344" y="414" class="ext-en">PostgreSQL · RLS</text>
  <text x="1344" y="432" class="ext-desc">提示词持久存储</text>
  <text x="1344" y="448" class="ext-desc">分类层级管理</text>
  <text x="1344" y="464" class="ext-desc">行级安全隔离</text>

  <rect x="1332" y="560" width="136" height="96" rx="8" fill="#ffffff" stroke="#a8a29e" stroke-width="1"/>
  <text x="1344" y="580" class="ext-name">对话模型</text>
  <text x="1344" y="594" class="ext-en">DeepSeek · optimize-prompt</text>
  <text x="1344" y="612" class="ext-desc">承担优化主力</text>
  <text x="1344" y="628" class="ext-desc">经边缘函数调用</text>
  <text x="1344" y="644" class="ext-desc">返回精炼文本</text>

  <!-- 外部连线 -->
  <line x1="1260" y1="560" x2="1332" y2="244" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5,3" marker-end="url(#arrow-ext)"/>
  <line x1="1260" y1="580" x2="1332" y2="424" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5,3" marker-end="url(#arrow-ext)"/>
  <line x1="1260" y1="600" x2="1332" y2="604" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5,3" marker-end="url(#arrow-ext)"/>

  <!-- 主流程标注 -->
  <text x="750" y="918" text-anchor="middle" class="arrow-label">主流程：用户操作 → 页面交互 → 状态协调 → 数据持久化 · 与 Web 端共用同一云端账号数据</text>

</svg>
"""

if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "docs" / "flutter_arch.svg"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(SVG, encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
