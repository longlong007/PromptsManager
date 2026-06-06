---
name: draw-architecture
description: Generate a high-quality LAYERED SYSTEM ARCHITECTURE diagram as a self-contained SVG file (cards-in-layers style, not a node-edge dependency graph). Uses a 4-layer vertical spine (frontend → middleware → core → persistence) plus left and right side rails for cross-cutting concerns. Enforces strict text discipline — no file names, no library names, no version numbers, no port numbers, no slashes in any visible text. Generates the SVG via a one-shot Python script (stdlib only, no external dependencies) to avoid UTF-8 corruption of Chinese text. Use when the user asks to 画架构图 / 生成架构图 / 系统架构图 / 整体架构图 / 模块架构图, or "draw a system architecture diagram", "visualize the layers of a system", "give me a high-level architecture overview", or wants a diagram showing what each layer of a system DOES (as opposed to how modules depend on each other, which is the `draw-module-deps` skill).
---

# Draw Architecture Diagram

Generates a clean, layered system architecture SVG meant for docs, slides, or onboarding decks. Each module is a small card showing **"what it is + what it does"** — never **"how it's implemented"** (no file names, no library names, no version numbers).

## When to use this skill

Trigger when the user wants a static, layered overview of a system:

- 画架构图 / 生成架构图 / 系统架构图
- "draw a system architecture diagram"
- "visualize the layers of a system"
- "give me a high-level overview"

## When NOT to use

- For module-level dependency graphs (arrows from A → B because A imports B) → use the `draw-module-deps` skill.
- For sequence / call-flow diagrams → this skill is for static layered overview only.
- For ER / schema diagrams → this skill is component-oriented, not data-oriented.

## Output convention

Always produce **two files**:

- `docs/<name>.svg` — the final SVG (self-contained, no external assets)
- `scripts/gen_<name>_svg.py` — the generator script (kept so the user can tweak text/layout later by editing the script, not the SVG)

## Workflow

### Step 1: Gather inputs

Ask the user (or infer from open files / existing docs) the following 6 items. If anything is missing, ask once with `AskQuestion` (or just ask plain text):

```
1. System name           : e.g. WeMediaV2
2. One-line positioning  : who it's for, what it solves
3. Main flow (4 stages)  : <input> → <process> → <enrich> → <output>
4. Module list           : internal modules; can paste a codebase tree
5. Cross-cutting concerns: config / prompts / tests / observability / ops
6. External dependencies : LLM APIs / databases / 3rd-party services
```

### Step 2: Decide the layout

Default template (`viewBox 1500 × 870`):

```
┌─────────────────────────────────────────────────────────────┐
│              TITLE  ·  SUBTITLE (one-line positioning)       │
├─────────┬──────────────────────────────────────┬────────────┤
│  Left   │     Main Spine (centered, vertical)   │   Right    │
│ Sidebar │                                       │  Sidebar   │
│         │  ① Frontend / Entry      (blue band)  │            │
│         │       ↓ HTTP (JSON)                   │            │
│ ┌─────┐ │                                       │ ┌────────┐ │
│ │card1│ │  ② Middleware · Gateway  (amber band) │ │ card 1 │ │
│ └─────┘ │       ↓ calls core                    │ └────────┘ │
│ ┌─────┐ │                                       │ ┌────────┐ │
│ │card2│ │  ③ Backend · Core libs   (green band) │ │ card 2 │ │
│ └─────┘ │       ↓ persists                      │ └────────┘ │
│ ┌─────┐ │                                       │ ┌────────┐ │
│ │card3│ │  ④ Persistence           (pink band)  │ │External│ │
│ └─────┘ │                                       │ │  API   │ │
└─────────┴──────────────────────────────────────┴────────────┘
```

**Layer color palette** (stable, do not change):

| Layer | Fill | Stroke |
|---|---|---|
| ① Frontend / Entry | `#eff6ff` | `#3b82f6` |
| ② Middleware / Gateway | `#fef3c7` | `#f59e0b` |
| ③ Core libs / Domain | `#ecfdf5` | `#10b981` |
| ④ Persistence / IO | `#fdf2f8` | `#ec4899` |
| Side rails (周边支撑) | `#f1f5f9` | `#64748b` dashed `6,4` |
| External services | `#fafaf9` | `#a8a29e` dashed `4,4` |

**Fonts** (stable, do not change):

```
font-family: -apple-system, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif
```

**Adapt to system reality**:

- Fewer than 4 conceptual layers? Drop one band — keep colors in order (skip middle).
- More than 4? Use a taller viewBox; never compress text.
- Fewer cross-cutting concerns? Drop the rail entirely (don't fake content).
- No external API? Drop the external block.

### Step 3: Write the generator script (CRITICAL)

**Do NOT write the SVG file directly.** Known issue: large Chinese-heavy SVG strings can have UTF-8 bytes corrupted to `U+FFFD` by some editor / tool chains. Always wrap the SVG in a Python script:

```python
"""scripts/gen_<name>_svg.py — one-shot architecture SVG generator."""
from pathlib import Path

SVG = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 870"
     font-family="-apple-system, 'PingFang SC', 'Microsoft YaHei', Helvetica, sans-serif">
  <defs>
    <style><![CDATA[
      .title       { font-size: 22px; font-weight: 700; fill: #0f172a; }
      .subtitle    { font-size: 13px; fill: #475569; }
      .layer-label { font-size: 13px; font-weight: 700; fill: #475569; letter-spacing: 2px; }
      .module-name { font-size: 13px; font-weight: 700; fill: #0f172a; }
      .module-desc { font-size: 11px; fill: #334155; }
      .badge       { font-size: 10px; font-weight: 700; fill: #ffffff; }
      .infra-name  { font-size: 13px; font-weight: 700; fill: #0f172a; }
      .infra-desc  { font-size: 11px; fill: #475569; }
      .arrow-label { font-size: 10.5px; fill: #64748b; font-style: italic; }
    ]]></style>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
    </marker>
    <marker id="arrow-ext" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <!-- TITLE -->
  <text x="750" y="38" text-anchor="middle" class="title">SYSTEM_NAME · 架构图</text>
  <text x="750" y="60" text-anchor="middle" class="subtitle">ONE_LINE_POSITIONING</text>

  <!-- LEFT SIDEBAR (周边支撑) at x=20-180 -->
  <!-- ... infra cards ... -->

  <!-- MAIN SPINE (shifted right by 160 to make room for left rail) -->
  <g transform="translate(160, 0)">
    <!-- Layer 1 (Frontend) at x=40, y=90-210 -->
    <!-- Layer 2 (Middleware) at x=40, y=265-395 -->
    <!-- Layer 3 (Core) at x=40, y=450-680 -->
    <!-- Layer 4 (Persistence) at x=40, y=740-850 -->
    <!-- Inter-layer arrows at x=590 -->
  </g>

  <!-- RIGHT SIDEBAR at x=1320-1480 -->
  <!-- ... infra cards + external API ... -->
</svg>
"""

if __name__ == "__main__":
    out = Path("docs/SYSTEM_NAME.svg")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(SVG, encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
```

### Step 4: Run + validate

```bash
python3 scripts/gen_<name>_svg.py
python3 ~/.cursor/skills/draw-architecture/scripts/validate_svg.py docs/<name>.svg
```

Validator checks (stdlib only, no install required):

1. XML parses cleanly
2. No `U+FFFD` replacement characters (UTF-8 corruption)
3. No `/` in any `<text>` element (text discipline)

**If any check fails: fix the generator script and regenerate.** Do not edit the SVG directly.

## Card text rules (硬约束)

Each module card has:

- **Line 1**: module name — a noun phrase, 4-6 Chinese characters (or 1-3 English words), 13px bold
- **Lines 2-4**: 2-4 short descriptions, ≤ 12 Chinese chars (or ≤ 30 English chars) each, plain "what + does"

### Forbidden in any visible text

| Forbidden | Replace with |
|---|---|
| `/` character (slash) | Use `·` (middle dot) or line break |
| File names (`*.py`, `*.ts`, `*.yaml`, `*.json`) | Delete entirely |
| Version numbers (`Next.js 15`, `v4-pro`, `bge-m3`) | Delete entirely |
| Port numbers, IPs, DB file names | Delete entirely |
| Env var names (`XXX_API_KEY`, `DATABASE_URL`) | Use the word "密钥" or "credential" |
| Library / framework names (`SQLAlchemy`, `APScheduler`, `Jinja2`, `FastAPI`, `React`) | Use the corresponding capability name |
| Internal field / param / function names | Use business terms |

### ✅ Good vs ❌ Bad examples

| ✅ Good (says WHAT it does) | ❌ Bad (says HOW it's done) |
|---|---|
| 检索引擎 — 多粒度切块入向量库 | rag/ — retrieve.py 融合 bm25/向量 |
| 接口服务 — 对外唯一服务入口 | core/api/ — FastAPI 14 个 router |
| 数据契约 — 内容输入输出统一定义 | contracts/ — Pydantic schemas |
| 内容打分 — 四维评分 + 时效衰减 | scoring.py — LLM 评分（价值/独特/可信/可读）|
| 对话模型 — 承担生成主力 | DeepSeek v4-flash · DEEPSEEK_API_KEY |
| 关系型主库 — 承载内容、关系、运行记录 | SQLite · data/wemedia.db (SQLAlchemy ORM) |

## Quick checklist before finishing

- [ ] Main spine layers use the standard color palette (blue / amber / green / pink)
- [ ] Each card has ≤ 4 lines of description
- [ ] Side rail cards use dashed gray (visually distinct from main spine)
- [ ] External API uses lighter dashed gray (visually distinct from side rails)
- [ ] Cross-layer arrows each have a short label (`HTTP`, `调用核心库`, `持久化`, etc.)
- [ ] No `/`, no file names, no version numbers, no library names anywhere
- [ ] `validate_svg.py` returns `[OK]`
- [ ] Both `docs/<name>.svg` and `scripts/gen_<name>_svg.py` exist

## Tips

- **Re-running is free.** If a card's text feels wrong, just edit the Python string and re-run the generator. Never hand-edit the SVG.
- **Side rails are optional.** If the user has fewer than 2 cross-cutting concerns, drop the rail entirely instead of padding it with weak content.
- **Title language follows the user.** Chinese user → Chinese title. English user → English title. Don't mix.
- **Don't over-architect.** If the system genuinely has only 3 layers, show 3; don't invent a 4th.
- **The card describes ROLES, not files.** "内容打分" is a role; "scoring.py" is a file. Always pick the role.
