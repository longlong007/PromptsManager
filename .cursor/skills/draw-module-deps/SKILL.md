---
name: draw-module-deps
description: Produce a clean, layered module-dependency SVG diagram from a project's module list and dependency edges. Generates a self-contained SVG with fan-out port slots that prevent edge overlap, distinguishes static imports (solid) from runtime calls (dashed), and uses a left-to-right entry→service→base layered layout. Use when the user asks to draw a module dependency graph, architecture diagram, dependency map, "依赖图"/"模块关系图"/"架构图", or wants to visualize how Python packages, npm packages, or any source modules depend on each other.
---

# Draw Module Dependency Graph

Produces a single self-contained SVG that visualizes how a project's internal modules depend on each other, using a layered layout with non-overlapping edges.

## When to use

Trigger whenever the user wants to:

- Visualize module-level dependencies of a codebase
- Draw an architecture diagram showing layered structure (entry → service → base)
- Spot circular dependencies, high fan-out modules, or layering violations
- Produce a docs/architecture image they can paste into a README

## Output

A single `.svg` file. No external assets, no embedded raster images. Self-contained, openable in any browser.

## Workflow

### Step 1: Gather inputs from the user

Ask for (or infer from the repo):

1. **Project name** — used in the title
2. **Columns** — 1 to 4 layers, left to right (most depended-on goes right)
3. **Nodes** — `{id, column, title, desc[]}`, 1–2 desc lines max
4. **Edges** — `{src, tgt, kind, label?}` where `kind ∈ {hard, soft}`
   - `hard` = static `import` (solid line)
   - `soft` = HTTP / subprocess / `importlib` / documented call (dashed line)

If the user gives you a codebase instead of a YAML, run `ast`/`rg` to enumerate `import` statements yourself, then condense to module-level (collapse `core.llm.chat.deepseek` → `core.llm`, etc.).

### Step 2: Layout sizing

```
viewBox width  = 1600 (fits ~4 columns comfortably)
viewBox height = title(80) + legend(60) + max_column_content + legend_box(160) + 40

column geometry (default 4-column layout):
  col 0: x=40..370   (width 330)
  col 1: x=405..715  (width 310)
  col 2: x=750..1180 (width 430)
  col 3: x=1215..1560 (width 345)

inside each column:
  nodes are 240~250 wide, 64~78 tall, stacked with 26px vertical gap
  first node top = 210, second top = first.top + first.h + 26, ...
```

For fewer columns, drop the rightmost ones and shift content left, or widen remaining columns.

### Step 3: Pick column tint

Use one of these palettes per column (in left-to-right order, vary so adjacent columns differ):

| Palette | Column bg / border  | Node bg / border    |
|---------|---------------------|---------------------|
| blue    | `#eff6ff` / `#93c5fd` | `#dbeafe` / `#60a5fa` |
| orange  | `#fff7ed` / `#fdba74` | `#ffedd5` / `#fb923c` |
| green   | `#ecfdf5` / `#6ee7b7` | `#dcfce7` / `#34d399` |
| pink    | `#fdf2f8` / `#f9a8d4` | `#fce7f3` / `#f472b6` |
| slate   | `#f8fafc` / `#cbd5e1` | `#e2e8f0` / `#94a3b8` |

Edge colors: hard = `#64748b`, soft = `#475569` (with `stroke-dasharray="5,4"`).

### Step 4: Generate the SVG

Write the inline Python script in this skill to a temp file, fill in `NODES` and `EDGES` based on user input, run it, capture stdout, and embed inside the SVG skeleton below.

## SVG skeleton

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 H" font-family="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif">
<defs>
<style><![CDATA[
.title{font-size:25px;font-weight:800;fill:#0f172a}
.sub{font-size:13px;fill:#475569}
.section{font-size:14px;font-weight:800;fill:#334155}
.txt{font-size:11px;fill:#334155}
.small{font-size:10px;fill:#64748b}
.node-title{font-size:13px;font-weight:800;fill:#0f172a}
.node-desc{font-size:10.5px;fill:#475569}
.edge-label{font-size:9.5px;fill:#64748b;font-style:italic}
.legend{font-size:11px;fill:#334155}
.group-label{font-size:12px;font-weight:800;fill:#475569;letter-spacing:.6px}
]]></style>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
</marker>
</defs>

<!-- Title + subtitle -->
<text x="800" y="38" class="title" text-anchor="middle">{PROJECT} 模块依赖图</text>
<text x="800" y="62" class="sub" text-anchor="middle">只展示项目自有模块；外部库不画。实线=代码导入，虚线=HTTP/动态加载/脚本调用。</text>

<!-- Legend bar -->
<rect x="40" y="82" width="1520" height="52" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>
<line x1="70" y1="106" x2="125" y2="106" stroke="#475569" stroke-width="1.2" marker-end="url(#arrow)"/>
<text x="140" y="110" class="legend">硬依赖：Python/TS import</text>
<line x1="340" y1="106" x2="395" y2="106" stroke="#475569" stroke-width="1.2" stroke-dasharray="5,4" marker-end="url(#arrow)"/>
<text x="410" y="110" class="legend">软依赖：HTTP / importlib / 文档约定脚本调用</text>
<text x="810" y="110" class="small">扫描范围：…（项目实际扫描目录）</text>

<!-- Column panels (loop over columns) -->
<rect x="{col.left}" y="160" width="{col.width}" height="{col.height}" rx="14" fill="{col.bg}" stroke="{col.border}" stroke-width="1.4"/>
<text x="{col.left+20}" y="185" class="group-label">{col.name}</text>

<!-- Node rects (loop over nodes) -->
<rect x="{n.left}" y="{n.top}" width="{n.width}" height="{n.height}" rx="9" fill="{n.bg}" stroke="{n.border}" stroke-width="1.4"/>
<text x="{n.left+14}" y="{n.top+24}" class="node-title">{n.title}</text>
<text x="{n.left+14}" y="{n.top+43}" class="node-desc">{n.desc[0]}</text>
<text x="{n.left+14}" y="{n.top+58}" class="node-desc">{n.desc[1]}</text>

<!-- Edges (generated by the Python script below) -->
{EDGES_PATH_BLOCK}

<!-- Reading guide box at the bottom -->
<rect x="40" y="{H-175}" width="1520" height="150" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>
<text x="65" y="{H-148}" class="section">读图说明</text>
<text x="65" y="{H-124}" class="txt">主图以目录级模块展示，避免线条过载。动态依赖用虚线表示。</text>
<text x="65" y="{H-100}" class="txt">主要高扇出模块：…（fan-out top 3-4）。它们是架构上最容易形成耦合的入口/编排模块。</text>
<text x="65" y="{H-76}"  class="txt">主要基础模块：…（fan-in top 3-4）。上层应依赖它们，反向依赖应避免。</text>
<text x="65" y="{H-52}"  class="txt">读图方向：箭头 A -&gt; B 表示 A 依赖 B。</text>
</svg>
```

## Python script for edge generation

Inline this script (no external files). Save to a temp `.py`, fill in `NODES` and `EDGES`, run, and paste stdout into the SVG.

```python
"""Generate non-overlapping edges for the module-dep SVG.

Fill in NODES and EDGES from user input, then run:
    python3 this_script.py > edges.svg-fragment
"""
from __future__ import annotations
from collections import defaultdict
from dataclasses import dataclass


@dataclass(frozen=True)
class Node:
    name: str
    left: int
    top: int
    width: int
    height: int
    @property
    def right(self): return self.left + self.width
    @property
    def bottom(self): return self.top + self.height
    @property
    def cx(self): return self.left + self.width // 2


# === FILL IN: your nodes (id -> Node) =================================
NODES = {
    # example:
    # "cli":        Node("cli",        70, 545, 240, 70),
    # "core.api":   Node("core.api",  445, 215, 230, 70),
    # ...
}

# === FILL IN: your edges ==============================================
# kind ∈ {"hard", "soft"};  label is optional
EDGES = [
    # ("cli", "core.api", "hard", None),
    # ("web.lib", "core.api", "soft", "HTTP /api/proxy"),
]


def _blocked(s: Node, t: Node) -> bool:
    lo, hi = (s.top, t.top) if t.top > s.top else (t.top, s.top)
    for n in NODES.values():
        if n.name in (s.name, t.name): continue
        if abs(n.cx - s.cx) < 5 and lo < n.top < hi: return True
    return False


def edge_dir(i: int) -> str:
    s, t = NODES[EDGES[i][0]], NODES[EDGES[i][1]]
    if abs(s.cx - t.cx) < 5:
        return "vdetour" if _blocked(s, t) else ("down" if t.top > s.top else "up")
    return "right" if t.cx > s.cx else "left"


def slot(start: int, length: int, idx: int, total: int, margin: int = 10) -> float:
    if total <= 1: return start + length / 2
    return start + margin + (length - 2 * margin) * idx / (total - 1)


def assign_horizontal_ports():
    out_by, in_by = defaultdict(list), defaultdict(list)
    for i in range(len(EDGES)):
        d = edge_dir(i)
        if d in ("right", "left"):
            s, t = EDGES[i][0], EDGES[i][1]
            out_by[(s, d)].append(i)
            in_by[(t, "left" if d == "right" else "right")].append(i)
    ports = {}
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


def assign_vertical_ports():
    out_by, in_by = defaultdict(list), defaultdict(list)
    for i in range(len(EDGES)):
        d = edge_dir(i)
        if d in ("down", "up"):
            out_by[(EDGES[i][0], d)].append(i)
            in_by[(EDGES[i][1], "top" if d == "down" else "bottom")].append(i)
    ports = {}
    for (sn, side), idxs in out_by.items():
        s = NODES[sn]; y = s.bottom if side == "down" else s.top
        if len(idxs) == 1:
            ports[idxs[0]] = (s.cx, y, 0, 0, side)
        else:
            idxs.sort(key=lambda i: NODES[EDGES[i][1]].cx)
            for k, i in enumerate(idxs):
                ports[i] = (slot(s.left, s.width, k, len(idxs)), y, 0, 0, side)
    for (tn, side), idxs in in_by.items():
        t = NODES[tn]; y = t.top if side == "top" else t.bottom
        if len(idxs) == 1:
            i = idxs[0]; sx, sy, _tx, _ty, sd = ports[i]
            ports[i] = (sx, sy, t.cx, y, sd)
        else:
            idxs.sort(key=lambda i: NODES[EDGES[i][0]].cx)
            for k, i in enumerate(idxs):
                sx, sy, _tx, _ty, sd = ports[i]
                ports[i] = (sx, sy, slot(t.left, t.width, k, len(idxs)), y, sd)
    return ports


def render() -> str:
    h, v = assign_horizontal_ports(), assign_vertical_ports()
    out = []
    for i, (sn, tn, kind, label) in enumerate(EDGES):
        s, t = NODES[sn], NODES[tn]
        d = edge_dir(i)
        dash = ' stroke-dasharray="5,4"' if kind == "soft" else ""
        stroke = "#475569" if kind == "soft" else "#64748b"
        if d in ("right", "left"):
            sx, sy, tx, ty, side = h[i]
            dx = max(40, min(140, abs(tx - sx) * 0.45))
            cx1, cx2 = (sx + dx, tx - dx) if side == "right" else (sx - dx, tx + dx)
            out.append(f'<path d="M{sx:.0f} {sy:.1f} C{cx1:.0f} {sy:.1f}, {cx2:.0f} {ty:.1f}, {tx:.0f} {ty:.1f}" fill="none" stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>')
            if label:
                out.append(f'<text x="{(sx+tx)/2:.1f}" y="{(sy+ty)/2-4:.1f}" class="edge-label">{label}</text>')
        elif d in ("down", "up"):
            sx, sy, tx, ty, _ = v[i]
            out.append(f'<line x1="{sx:.0f}" y1="{sy:.0f}" x2="{tx:.0f}" y2="{ty:.0f}" stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>')
            if label:
                out.append(f'<text x="{(sx+tx)/2+6:.1f}" y="{(sy+ty)/2+3:.1f}" class="edge-label">{label}</text>')
        else:  # vdetour
            same = [j for j in range(len(EDGES)) if edge_dir(j) == "vdetour" and EDGES[j][0] == sn]
            same.sort(key=lambda j: abs(NODES[EDGES[j][1]].top - NODES[EDGES[j][0]].top))
            dx = s.right + 22 + same.index(i) * 12
            down = t.top > s.top
            sy = s.bottom - 10 if down else s.top + 10
            ty = t.top + 10 if down else t.bottom - 10
            out.append(f'<path d="M{s.right} {sy:.1f} C{dx:.0f} {sy:.1f}, {dx:.0f} {ty:.1f}, {t.right} {ty:.1f}" fill="none" stroke="{stroke}" stroke-width="1.2"{dash} marker-end="url(#arrow)"/>')
            if label:
                out.append(f'<text x="{dx+4:.1f}" y="{(sy+ty)/2:.1f}" class="edge-label">{label}</text>')
    return "\n".join(out)


if __name__ == "__main__":
    print(render())
```

## Acceptance checklist

After generating, verify:

- [ ] Every edge endpoint sits on some node's boundary (tolerance 0.5px). A node at `(left, top, w, h)` has boundary y ∈ `[top, top+h]` when x = `left` or `left+w`, and boundary x ∈ `[left, left+w]` when y = `top` or `top+h`.
- [ ] Within the same node + same side, edge port `y` values are strictly increasing (no two edges share a port).
- [ ] `vdetour` lanes (`src.right + 22 + slot*12`) are still inside the column panel; if not, widen the column.
- [ ] `viewBox` height = last bottom y + 25; no large blank strip below the reading-guide box.
- [ ] No "fixed historical issue" / "TODO" / "deprecated" annotations — the diagram shows the final state only.

## Style guardrails

- Only draw **internal modules**. No `pip` / `npm` / standard-library nodes.
- No test code, no `__pycache__`, no build artifacts.
- ≤ 4 columns and ≤ 25 nodes per diagram. If the project is larger, split into two diagrams (e.g. frontend / backend, or static-imports / runtime-calls).
- ≤ 2 desc lines per node. If a node needs more, it's actually two nodes.

## Examples

### Minimal 3-node input (Python toy)

```yaml
title: "Toy 项目模块依赖图"
columns:
  - { name: "入口",  tint: blue }
  - { name: "服务",  tint: orange }
  - { name: "基础",  tint: pink }
nodes:
  - { id: cli,     col: 0, title: "cli/",        desc: ["wm 命令入口"] }
  - { id: api,     col: 1, title: "core.api",    desc: ["FastAPI routers"] }
  - { id: db,      col: 2, title: "core.storage",desc: ["SQLAlchemy"] }
edges:
  - { src: cli, tgt: api, kind: hard }
  - { src: cli, tgt: db,  kind: hard }
  - { src: api, tgt: db,  kind: hard }
```

Fill `NODES` and `EDGES` in the script as:

```python
NODES = {
    "cli":   Node("cli",   70, 215, 240, 64),
    "api":   Node("api",   445, 215, 230, 70),
    "db":    Node("db",    790, 215, 250, 64),
}
EDGES = [
    ("cli", "api", "hard", None),
    ("cli", "db",  "hard", None),
    ("api", "db",  "hard", None),
]
```

Run, paste output between the node rects and reading-guide box in the SVG skeleton.

### Auto-extracting edges from a Python repo

```bash
python3 -c "
import ast, os
edges = set()
for d, _, fs in os.walk('.'):
    if any(x in d for x in ('.venv','__pycache__','tests','node_modules','.git')): continue
    for f in fs:
        if not f.endswith('.py'): continue
        p = os.path.join(d, f)
        src = '.'.join(p[2:].split(os.sep)).removesuffix('.py').rsplit('.',1)[0]
        try: t = ast.parse(open(p).read())
        except: continue
        for n in ast.walk(t):
            if isinstance(n, ast.ImportFrom) and n.module:
                edges.add((src.split('.')[0], n.module.split('.')[0]))
            elif isinstance(n, ast.Import):
                for a in n.names:
                    edges.add((src.split('.')[0], a.name.split('.')[0]))
for e in sorted(edges): print(e)
"
```

Then manually classify each edge as `hard` (default) vs `soft` (HTTP/subprocess) and fill `EDGES`.
