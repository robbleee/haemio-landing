import type { FlowTheme } from "./types.js";
export declare const DEFAULT_THEME: Required<Pick<FlowTheme, "fontFamily" | "fontSize" | "nodePadding" | "nodeRadius" | "nodeBorderWidth" | "edgeWidth" | "arrowSize" | "direction">> & {
    colors: Required<NonNullable<FlowTheme["colors"]>>;
};
export declare function resolveTheme(user?: FlowTheme): Required<Pick<FlowTheme, "fontFamily" | "fontSize" | "nodePadding" | "nodeRadius" | "nodeBorderWidth" | "edgeWidth" | "arrowSize" | "direction">> & {
    colors: Required<NonNullable<FlowTheme["colors"]>>;
};
export declare function getNodeColor(type: string | undefined, theme: ReturnType<typeof resolveTheme>): string;
export declare function getNodeBorderColor(type: string | undefined, theme: ReturnType<typeof resolveTheme>): string;
//# sourceMappingURL=theme.d.ts.map