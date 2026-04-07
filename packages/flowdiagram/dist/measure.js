// Character width approximation for common fonts at a given size.
// Based on average character widths for Inter/system-ui.
const CHAR_WIDTH_RATIO = 0.6;
const LINE_HEIGHT_RATIO = 1.45;
const MAX_LABEL_WIDTH = 200;
export function measureText(text, fontSize, maxWidth = MAX_LABEL_WIDTH) {
    const charWidth = fontSize * CHAR_WIDTH_RATIO;
    const lineHeight = fontSize * LINE_HEIGHT_RATIO;
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = testLine.length * charWidth;
        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        }
        else {
            currentLine = testLine;
        }
    }
    if (currentLine)
        lines.push(currentLine);
    const width = Math.max(...lines.map((l) => l.length * charWidth));
    const height = lines.length * lineHeight;
    return { width, height, lines };
}
export function measureNode(node, theme) {
    const label = measureText(node.label, theme.fontSize);
    const desc = node.description
        ? measureText(node.description, theme.fontSize * 0.85)
        : { width: 0, height: 0, lines: [] };
    const contentWidth = Math.max(label.width, desc.width);
    const contentHeight = label.height + (desc.height ? desc.height + 8 : 0);
    // Diamonds: text must fit inside the inscribed rectangle, which is ~50% of
    // the diamond area. So we need roughly 2x the padding on each axis.
    const isDiamond = node.type === "decision";
    const padX = isDiamond ? theme.nodePadding.x * 2.8 : theme.nodePadding.x;
    const padY = isDiamond ? theme.nodePadding.y * 2.2 : theme.nodePadding.y;
    const width = Math.ceil(contentWidth + padX * 2);
    const height = Math.ceil(contentHeight + padY * 2);
    // Enforce minimum sizes for visual consistency
    const minW = isDiamond ? 180 : 120;
    const minH = isDiamond ? 100 : 52;
    return {
        width: Math.max(width, minW),
        height: Math.max(height, minH),
        labelLines: label.lines,
        descLines: desc.lines,
    };
}
//# sourceMappingURL=measure.js.map