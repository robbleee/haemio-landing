export type { FlowConfig, FlowNode, FlowEdge, FlowTheme, NodeType, LayoutResult } from "./types.js";
export { computeLayout } from "./layout.js";
export { renderSVG } from "./render.js";
export { DEFAULT_THEME, resolveTheme } from "./theme.js";

import type { FlowConfig } from "./types.js";
import { computeLayout } from "./layout.js";
import { renderSVG } from "./render.js";

/**
 * One-call convenience: config in, SVG string out.
 */
export async function flowToSVG(config: FlowConfig): Promise<string> {
  const layout = await computeLayout(config);
  return renderSVG(config, layout);
}
