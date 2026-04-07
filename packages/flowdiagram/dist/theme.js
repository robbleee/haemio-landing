export const DEFAULT_THEME = {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSize: 14,
    nodePadding: { x: 28, y: 18 },
    nodeRadius: 10,
    nodeBorderWidth: 1.5,
    edgeWidth: 1.5,
    arrowSize: 10,
    direction: "DOWN",
    colors: {
        background: "#ffffff",
        text: "#1e293b",
        border: "#cbd5e1",
        edge: "#64748b",
        edgeLabel: "#475569",
        input: "#dbeafe",
        output: "#fce7f3",
        action: "#e0e7ff",
        decision: "#fef9c3",
        process: "#f3e8ff",
        classifier: "#d1fae5",
    },
};
export function resolveTheme(user) {
    if (!user)
        return DEFAULT_THEME;
    return {
        fontFamily: user.fontFamily ?? DEFAULT_THEME.fontFamily,
        fontSize: user.fontSize ?? DEFAULT_THEME.fontSize,
        nodePadding: user.nodePadding ?? DEFAULT_THEME.nodePadding,
        nodeRadius: user.nodeRadius ?? DEFAULT_THEME.nodeRadius,
        nodeBorderWidth: user.nodeBorderWidth ?? DEFAULT_THEME.nodeBorderWidth,
        edgeWidth: user.edgeWidth ?? DEFAULT_THEME.edgeWidth,
        arrowSize: user.arrowSize ?? DEFAULT_THEME.arrowSize,
        direction: user.direction ?? DEFAULT_THEME.direction,
        colors: { ...DEFAULT_THEME.colors, ...user.colors },
    };
}
export function getNodeColor(type, theme) {
    if (!type)
        return theme.colors.action;
    return theme.colors[type] ?? theme.colors.action;
}
export function getNodeBorderColor(type, theme) {
    const bg = getNodeColor(type, theme);
    return darkenHex(bg, 0.25);
}
function darkenHex(hex, amount) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
//# sourceMappingURL=theme.js.map