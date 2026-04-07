import { resolveTheme, getNodeColor, getNodeBorderColor } from "./theme.js";
import { measureNode, measureText } from "./measure.js";
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
// ── SVG defs (filters, markers) ─────────────────────────────
function renderDefs(theme) {
    const as = theme.arrowSize;
    return `<defs>
  <marker id="arrowhead" markerWidth="${as}" markerHeight="${as * 0.7}" refX="${as - 1}" refY="${as * 0.35}" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
    <path d="M 0 0 L ${as} ${as * 0.35} L 0 ${as * 0.7} z" fill="${theme.colors.edge}" />
  </marker>
  <filter id="shadow" x="-8%" y="-8%" width="120%" height="130%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.08" />
  </filter>
</defs>`;
}
// ── Node shapes ─────────────────────────────────────────────
function renderNodeShape(ln, theme) {
    const fill = ln.node.color ?? getNodeColor(ln.node.type, theme);
    const stroke = getNodeBorderColor(ln.node.type, theme);
    const { type } = ln.node;
    const sw = theme.nodeBorderWidth;
    if (type === "decision") {
        const cx = ln.x + ln.width / 2;
        const cy = ln.y + ln.height / 2;
        const hw = ln.width / 2;
        const hh = ln.height / 2;
        return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" filter="url(#shadow)" />`;
    }
    if (type === "input" || type === "output") {
        const r = ln.height / 2;
        return `<rect x="${ln.x}" y="${ln.y}" width="${ln.width}" height="${ln.height}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" filter="url(#shadow)" />`;
    }
    return `<rect x="${ln.x}" y="${ln.y}" width="${ln.width}" height="${ln.height}" rx="${theme.nodeRadius}" ry="${theme.nodeRadius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" filter="url(#shadow)" />`;
}
// ── Node label ──────────────────────────────────────────────
function renderNodeLabel(ln, theme) {
    const m = measureNode(ln.node, theme);
    const cx = ln.x + ln.width / 2;
    const lineHeight = theme.fontSize * 1.45;
    const parts = [];
    const labelBlockHeight = m.labelLines.length * lineHeight;
    const descFontSize = theme.fontSize * 0.85;
    const descLineHeight = descFontSize * 1.45;
    const descBlockHeight = m.descLines.length * descLineHeight;
    const gap = m.descLines.length > 0 ? 8 : 0;
    const totalHeight = labelBlockHeight + gap + descBlockHeight;
    // Vertically center all text within the node
    const startY = ln.y + (ln.height - totalHeight) / 2 + theme.fontSize * 0.85;
    for (let i = 0; i < m.labelLines.length; i++) {
        parts.push(`<text x="${cx}" y="${startY + i * lineHeight}" text-anchor="middle" fill="${theme.colors.text}" font-family="${theme.fontFamily}" font-size="${theme.fontSize}" font-weight="600" dominant-baseline="auto">${escapeXml(m.labelLines[i])}</text>`);
    }
    if (m.descLines.length > 0) {
        const descStartY = startY + labelBlockHeight + gap;
        for (let i = 0; i < m.descLines.length; i++) {
            parts.push(`<text x="${cx}" y="${descStartY + i * descLineHeight}" text-anchor="middle" fill="${theme.colors.edgeLabel}" font-family="${theme.fontFamily}" font-size="${descFontSize}" font-weight="400">${escapeXml(m.descLines[i])}</text>`);
        }
    }
    return parts.join("\n");
}
// ── Edge path ───────────────────────────────────────────────
function renderEdgePath(le, theme) {
    if (le.points.length < 2)
        return "";
    const color = le.edge.color ?? theme.colors.edge;
    const dashAttr = le.edge.dashed ? ` stroke-dasharray="6 4"` : "";
    const path = buildSmoothPath(le.points);
    let svg = `<path d="${path}" fill="none" stroke="${color}" stroke-width="${theme.edgeWidth}"${dashAttr} marker-end="url(#arrowhead)" />`;
    // Edge label — clean text with a tight white background
    if (le.edge.label && le.labelPosition) {
        const { x, y } = le.labelPosition;
        const labelFontSize = theme.fontSize * 0.85;
        const measured = measureText(le.edge.label, labelFontSize, 120);
        const padX = 6;
        const padY = 3;
        const bgW = measured.width + padX * 2;
        const bgH = labelFontSize + padY * 2;
        svg += `\n<rect x="${x - bgW / 2}" y="${y - bgH / 2}" width="${bgW}" height="${bgH}" rx="3" fill="${theme.colors.background}" />`;
        svg += `\n<text x="${x}" y="${y + labelFontSize * 0.35}" text-anchor="middle" fill="${theme.colors.edgeLabel}" font-family="${theme.fontFamily}" font-size="${labelFontSize}" font-weight="500">${escapeXml(le.edge.label)}</text>`;
    }
    return svg;
}
function buildSmoothPath(points) {
    if (points.length === 0)
        return "";
    if (points.length === 1)
        return `M ${points[0].x} ${points[0].y}`;
    const radius = 10;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (len1 === 0 || len2 === 0) {
            d += ` L ${curr.x} ${curr.y}`;
            continue;
        }
        const r = Math.min(radius, len1 / 2, len2 / 2);
        const bx = curr.x - (dx1 / len1) * r;
        const by = curr.y - (dy1 / len1) * r;
        const ax = curr.x + (dx2 / len2) * r;
        const ay = curr.y + (dy2 / len2) * r;
        d += ` L ${bx} ${by} Q ${curr.x} ${curr.y} ${ax} ${ay}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
}
// ── Title ───────────────────────────────────────────────────
function renderTitle(config, theme, width) {
    if (!config.title)
        return "";
    const titleSize = theme.fontSize * 1.4;
    return `<text x="${width / 2}" y="${titleSize + 12}" text-anchor="middle" fill="${theme.colors.text}" font-family="${theme.fontFamily}" font-size="${titleSize}" font-weight="700">${escapeXml(config.title)}</text>`;
}
// ── Main render ─────────────────────────────────────────────
export function renderSVG(config, layout) {
    const theme = resolveTheme(config.theme);
    const titleOffset = config.title ? 48 : 0;
    const pad = 16;
    const width = layout.width + pad * 2;
    const height = layout.height + titleOffset + pad * 2;
    const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`);
    parts.push(renderDefs(theme));
    // Background
    parts.push(`<rect width="${width}" height="${height}" fill="${theme.colors.background}" />`);
    // Title
    if (config.title) {
        parts.push(renderTitle(config, theme, width));
    }
    // Content group — offset for title + padding
    parts.push(`<g transform="translate(${pad}, ${titleOffset + pad})">`);
    // Edges first (behind nodes)
    for (const le of layout.edges) {
        parts.push(renderEdgePath(le, theme));
    }
    // Nodes — each wrapped in a <g> with data-node-id for click interaction
    for (const ln of layout.nodes) {
        parts.push(`<g data-node-id="${escapeXml(ln.node.id)}" style="cursor:pointer">`);
        parts.push(renderNodeShape(ln, theme));
        parts.push(renderNodeLabel(ln, theme));
        parts.push(`</g>`);
    }
    parts.push(`</g>`);
    parts.push(`</svg>`);
    return parts.join("\n");
}
//# sourceMappingURL=render.js.map