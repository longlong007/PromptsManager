"""apps/flutter/scripts/gen_flutter_module_deps_svg.py — 模块依赖 SVG 生成器."""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Node:
    name: str
    left: int
    top: int
    width: int
    height: int

    @property
    def right(self) -> int:
        return self.left + self.width

    @property
    def bottom(self) -> int:
        return self.top + self.height

    @property
    def cx(self) -> int:
        return self.left + self.width // 2


# column panels: (left, width, bg, border, label)
COLUMNS = [
    (40, 330, "#eff6ff", "#93c5fd", "入口层 · lib"),
    (405, 310, "#fff7ed", "#fdba74", "页面层 · screens"),
    (750, 430, "#ecfdf5", "#6ee7b7", "状态与服务 · providers · services"),
    (1215, 345, "#fdf2f8", "#f9a8d4", "基础层 · models · config"),
]

NODES: dict[str, Node] = {
    # col 0
    "main": Node("main", 70, 215, 250, 64),
    "app": Node("app", 70, 305, 250, 70),
    # col 1
    "login": Node("login", 435, 215, 250, 64),
    "dashboard": Node("dashboard", 435, 305, 250, 64),
    "list": Node("list", 435, 395, 250, 70),
    "detail": Node("detail", 435, 491, 250, 70),
    "categories": Node("categories", 435, 587, 250, 64),
    # col 2
    "auth_provider": Node("auth_provider", 780, 215, 250, 64),
    "prompt_provider": Node("prompt_provider", 780, 305, 250, 70),
    "prompt_repository": Node("prompt_repository", 780, 401, 250, 70),
    "ai_service": Node("ai_service", 780, 497, 250, 64),
    "copy_history": Node("copy_history", 780, 587, 250, 64),
    # col 3
    "models": Node("models", 1245, 305, 250, 78),
    "config": Node("config", 1245, 215, 250, 64),
}

NODE_META: dict[str, tuple[str, list[str]]] = {
    "main": ("main.dart", ["应用启动入口", "初始化环境与 Provider"]),
    "app": ("app.dart", ["GoRouter 路由定义", "登录守卫与全局主题"]),
    "login": ("login_screen.dart", ["邮箱登录与注册"]),
    "dashboard": ("dashboard_screen.dart", ["统计仪表盘与快捷入口"]),
    "list": ("prompt_list_screen.dart", ["搜索筛选与批量操作"]),
    "detail": ("prompt_detail_screen.dart", ["新建编辑与 AI 优化"]),
    "categories": ("categories_screen.dart", ["二级分类与拖拽排序"]),
    "auth_provider": ("auth_provider.dart", ["登录会话状态管理"]),
    "prompt_provider": ("prompt_provider.dart", ["提示词与分类业务状态"]),
    "prompt_repository": ("prompt_repository.dart", ["Supabase 表 CRUD"]),
    "ai_service": ("ai_service.dart", ["调用 optimize-prompt"]),
    "copy_history": ("copy_history_service.dart", ["本地复制历史持久化"]),
    "models": ("models", ["Prompt · Category · Variable"]),
    "config": ("app_config.dart", ["读取环境变量与配置"]),
}

# kind: hard = dart import
EDGES: list[tuple[str, str, str, str | None]] = [
    ("main", "app", "hard", None),
    ("main", "config", "hard", None),
    ("main", "auth_provider", "hard", None),
    ("main", "prompt_provider", "hard", None),
    ("app", "auth_provider", "hard", None),
    ("app", "login", "hard", None),
    ("app", "dashboard", "hard", None),
    ("app", "list", "hard", None),
    ("app", "detail", "hard", None),
    ("app", "categories", "hard", None),
    ("login", "auth_provider", "hard", None),
    ("dashboard", "auth_provider", "hard", None),
    ("dashboard", "prompt_provider", "hard", None),
    ("list", "models", "hard", None),
    ("list", "prompt_provider", "hard", None),
    ("list", "copy_history", "hard", None),
    ("detail", "models", "hard", None),
    ("detail", "prompt_provider", "hard", None),
    ("detail", "ai_service", "hard", None),
    ("detail", "copy_history", "hard", None),
    ("categories", "models", "hard", None),
    ("categories", "prompt_provider", "hard", None),
    ("prompt_provider", "models", "hard", None),
    ("prompt_provider", "prompt_repository", "hard", None),
    ("prompt_repository", "models", "hard", None),
]


def _blocked(s: Node, t: Node) -> bool:
    lo, hi = (s.top, t.top) if t.top > s.top else (t.top, s.top)
    for n in NODES.values():
        if n.name in (s.name, t.name):
            continue
        if abs(n.cx - s.cx) < 5 and lo < n.top < hi:
            return True
    return False


def edge_dir(i: int) -> str:
    s, t = NODES[EDGES[i][0]], NODES[EDGES[i][1]]
    if abs(s.cx - t.cx) < 5:
        return "vdetour" if _blocked(s, t) else ("down" if t.top > s.top else "up")
    return "right" if t.cx > s.cx else "left"


def slot(start: int, length: int, idx: int, total: int, margin: int = 10) -> float:
    if total <= 1:
        return start + length / 2
    return start + margin + (length - 2 * margin) * idx / (total - 1)


def assign_horizontal_ports() -> dict[int, tuple[float, float, float, float, str]]:
    out_by: dict[tuple[str, str], list[int]] = defaultdict(list)
    in_by: dict[tuple[str, str], list[int]] = defaultdict(list)
    for i in range(len(EDGES)):
        d = edge_dir(i)
        if d in ("right", "left"):
            s, t = EDGES[i][0], EDGES[i][1]
            out_by[(s, d)].append(i)
            in_by[(t, "left" if d == "right" else "right")].append(i)
    ports: dict[int, tuple[float, float, float, float, str]] = {}
    for (sn, side), idxs in out_by.items():
        s = NODES[sn]
        idxs.sort(key=lambda i: (NODES[EDGES[i][1]].top, NODES[EDGES[i][1]].cx))
        x = s.right if side == "right" else s.left
        for k, i in enumerate(idxs):
            ports[i] = (x, slot(s.top, s.height, k, len(idxs)), 0, 0, side)
    for (tn, side), idxs in in_by.items():
        t = NODES[tn]
        idxs.sort(key=lambda i: (NODES[EDGES[i][0]].top, NODES[EDGES[i][0]].cx))
        x = t.left if side == "left" else t.right
        for k, i in enumerate(idxs):
            sx, sy, _tx, _ty, sd = ports[i]
            ports[i] = (sx, sy, x, slot(t.top, t.height, k, len(idxs)), sd)
    return ports


def assign_vertical_ports() -> dict[int, tuple[float, float, float, float, str]]:
    out_by: dict[tuple[str, str], list[int]] = defaultdict(list)
    in_by: dict[tuple[str, str], list[int]] = defaultdict(list)
    for i in range(len(EDGES)):
        d = edge_dir(i)
        if d in ("down", "up"):
            out_by[(EDGES[i][0], d)].append(i)
            in_by[(EDGES[i][1], "top" if d == "down" else "bottom")].append(i)
    ports: dict[int, tuple[float, float, float, float, str]] = {}
    for (sn, side), idxs in out_by.items():
        s = NODES[sn]
        y = s.bottom if side == "down" else s.top
        if len(idxs) == 1:
            ports[idxs[0]] = (s.cx, y, 0, 0, side)
        else:
            idxs.sort(key=lambda i: NODES[EDGES[i][1]].cx)
            for k, i in enumerate(idxs):
                ports[i] = (slot(s.left, s.width, k, len(idxs)), y, 0, 0, side)
    for (tn, side), idxs in in_by.items():
        t = NODES[tn]
        y = t.top if side == "top" else t.bottom
        if len(idxs) == 1:
            i = idxs[0]
            sx, sy, _tx, _ty, sd = ports[i]
            ports[i] = (sx, sy, t.cx, y, sd)
        else:
            idxs.sort(key=lambda i: NODES[EDGES[i][0]].cx)
            for k, i in enumerate(idxs):
                sx, sy, _tx, _ty, sd = ports[i]
                ports[i] = (sx, sy, slot(t.left, t.width, k, len(idxs)), y, sd)
    return ports


def render_edges() -> str:
    h = assign_horizontal_ports()
    v = assign_vertical_ports()
    out: list[str] = []
    for i, (sn, tn, kind, label) in enumerate(EDGES):
        s, t = NODES[sn], NODES[tn]
        d = edge_dir(i)
        dash = ' stroke-dasharray="5,4"' if kind == "soft" else ""
        stroke = "#475569" if kind == "soft" else "#64748b"
        if d in ("right", "left"):
            sx, sy, tx, ty, side = h[i]
            dx = max(40, min(140, abs(tx - sx) * 0.45))
            cx1, cx2 = (sx + dx, tx - dx) if side == "right" else (sx - dx, tx + dx)
            out.append(
                f'<path d="M{sx:.0f} {sy:.1f} C{cx1:.0f} {sy:.1f}, {cx2:.0f} {ty:.1f}, {tx:.0f} {ty:.1f}" '
                f'fill="none" stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>'
            )
            if label:
                out.append(
                    f'<text x="{(sx+tx)/2:.1f}" y="{(sy+ty)/2-4:.1f}" class="edge-label">{label}</text>'
                )
        elif d in ("down", "up"):
            sx, sy, tx, ty, _ = v[i]
            out.append(
                f'<line x1="{sx:.0f}" y1="{sy:.0f}" x2="{tx:.0f}" y2="{ty:.0f}" '
                f'stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>'
            )
            if label:
                out.append(
                    f'<text x="{(sx+tx)/2+6:.1f}" y="{(sy+ty)/2+3:.1f}" class="edge-label">{label}</text>'
                )
        else:
            same = [j for j in range(len(EDGES)) if edge_dir(j) == "vdetour" and EDGES[j][0] == sn]
            same.sort(key=lambda j: abs(NODES[EDGES[j][1]].top - NODES[EDGES[j][0]].top))
            dx = s.right + 22 + same.index(i) * 12
            down = t.top > s.top
            sy = s.bottom - 10 if down else s.top + 10
            ty = t.top + 10 if down else t.bottom - 10
            out.append(
                f'<path d="M{s.right} {sy:.1f} C{dx:.0f} {sy:.1f}, {dx:.0f} {ty:.1f}, {t.right} {ty:.1f}" '
                f'fill="none" stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>'
            )
            if label:
                out.append(f'<text x="{dx+4:.1f}" y="{(sy+ty)/2:.1f}" class="edge-label">{label}</text>')
    return "\n".join(out)


def column_height() -> int:
    bottom = max(n.bottom for n in NODES.values())
    return bottom - 160 + 50


def render_columns() -> str:
    h = column_height()
    parts: list[str] = []
    for left, width, bg, border, label in COLUMNS:
        parts.append(
            f'<rect x="{left}" y="160" width="{width}" height="{h}" rx="14" '
            f'fill="{bg}" stroke="{border}" stroke-width="1.4"/>'
        )
        parts.append(f'<text x="{left + 20}" y="185" class="group-label">{label}</text>')
    return "\n".join(parts)


def render_nodes() -> str:
    tints = {
        0: ("#dbeafe", "#60a5fa"),
        1: ("#ffedd5", "#fb923c"),
        2: ("#dcfce7", "#34d399"),
        3: ("#fce7f3", "#f472b6"),
    }
    col_of = {
        "main": 0, "app": 0,
        "login": 1, "dashboard": 1, "list": 1, "detail": 1, "categories": 1,
        "auth_provider": 2, "prompt_provider": 2, "prompt_repository": 2,
        "ai_service": 2, "copy_history": 2,
        "models": 3, "config": 3,
    }
    parts: list[str] = []
    for nid, node in NODES.items():
        bg, border = tints[col_of[nid]]
        title, descs = NODE_META[nid]
        parts.append(
            f'<rect x="{node.left}" y="{node.top}" width="{node.width}" height="{node.height}" '
            f'rx="9" fill="{bg}" stroke="{border}" stroke-width="1.4"/>'
        )
        parts.append(f'<text x="{node.left + 14}" y="{node.top + 24}" class="node-title">{title}</text>')
        if descs:
            parts.append(f'<text x="{node.left + 14}" y="{node.top + 43}" class="node-desc">{descs[0]}</text>')
        if len(descs) > 1:
            parts.append(f'<text x="{node.left + 14}" y="{node.top + 58}" class="node-desc">{descs[1]}</text>')
    return "\n".join(parts)


def fan_stats() -> tuple[list[str], list[str]]:
    out_deg: dict[str, int] = defaultdict(int)
    in_deg: dict[str, int] = defaultdict(int)
    for s, t, *_ in EDGES:
        out_deg[s] += 1
        in_deg[t] += 1
    top_out = sorted(out_deg.items(), key=lambda x: -x[1])[:4]
    top_in = sorted(in_deg.items(), key=lambda x: -x[1])[:4]
    out_txt = "、".join(f"{NODE_META[k][0]}({v})" for k, v in top_out)
    in_txt = "、".join(f"{NODE_META[k][0]}({v})" for k, v in top_in)
    return out_txt, in_txt


def build_svg() -> str:
    h = 160 + column_height() + 200
    guide_y = h - 175
    top_out, top_in = fan_stats()
    edges = render_edges()
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 {h}" font-family="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif">
<defs>
<style><![CDATA[
.title{{font-size:25px;font-weight:800;fill:#0f172a}}
.sub{{font-size:13px;fill:#475569}}
.section{{font-size:14px;font-weight:800;fill:#334155}}
.txt{{font-size:11px;fill:#334155}}
.small{{font-size:10px;fill:#64748b}}
.node-title{{font-size:13px;font-weight:800;fill:#0f172a}}
.node-desc{{font-size:10.5px;fill:#475569}}
.edge-label{{font-size:9.5px;fill:#64748b;font-style:italic}}
.legend{{font-size:11px;fill:#334155}}
.group-label{{font-size:12px;font-weight:800;fill:#475569;letter-spacing:.6px}}
]]></style>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
</marker>
</defs>

<text x="800" y="38" class="title" text-anchor="middle">Prompt Manager Flutter 模块依赖图</text>
<text x="800" y="62" class="sub" text-anchor="middle">只展示 lib 自有模块；外部包不画。实线 = Dart import 硬依赖。</text>

<rect x="40" y="82" width="1520" height="52" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>
<line x1="70" y1="106" x2="125" y2="106" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
<text x="140" y="110" class="legend">硬依赖：Dart import</text>
<text x="810" y="110" class="small">扫描范围：apps/flutter/lib · 14 个模块 · 25 条边</text>

{render_columns()}

{render_nodes()}

{edges}

<rect x="40" y="{guide_y}" width="1520" height="150" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>
<text x="65" y="{guide_y + 27}" class="section">读图说明</text>
<text x="65" y="{guide_y + 51}" class="txt">主图以文件级模块展示 lib 目录 import 关系。所有依赖均为硬依赖（Dart import）。</text>
<text x="65" y="{guide_y + 75}" class="txt">主要高扇出模块：{top_out}。它们是架构上最容易形成耦合的编排入口。</text>
<text x="65" y="{guide_y + 99}" class="txt">主要基础模块：{top_in}。上层应依赖它们，反向依赖应避免。</text>
<text x="65" y="{guide_y + 123}" class="txt">读图方向：箭头 A → B 表示 A 依赖 B。页面经 Provider 访问仓储，部分页面直接调用 Service。</text>
</svg>
"""


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "docs" / "flutter_module_deps.svg"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build_svg(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
