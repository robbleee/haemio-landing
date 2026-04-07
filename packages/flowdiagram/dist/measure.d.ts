import type { FlowNode } from "./types.js";
import type { resolveTheme } from "./theme.js";
type ResolvedTheme = ReturnType<typeof resolveTheme>;
export declare function measureText(text: string, fontSize: number, maxWidth?: number): {
    width: number;
    height: number;
    lines: string[];
};
export declare function measureNode(node: FlowNode, theme: ResolvedTheme): {
    width: number;
    height: number;
    labelLines: string[];
    descLines: string[];
};
export {};
//# sourceMappingURL=measure.d.ts.map