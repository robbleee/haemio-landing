export type { FlowConfig, FlowNode, FlowEdge, FlowTheme, NodeType, LayoutResult } from "./types.js";
export { computeLayout } from "./layout.js";
export { renderSVG } from "./render.js";
export { DEFAULT_THEME, resolveTheme } from "./theme.js";
import type { FlowConfig } from "./types.js";
/**
 * One-call convenience: config in, SVG string out.
 */
export declare function flowToSVG(config: FlowConfig): Promise<string>;
//# sourceMappingURL=index.d.ts.map