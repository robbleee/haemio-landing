export type NodeType = "input" | "output" | "action" | "decision" | "process" | "classifier";
export interface FlowNode {
    id: string;
    label: string;
    type?: NodeType;
    description?: string;
    color?: string;
    icon?: string;
}
export interface FlowEdge {
    from: string;
    to: string;
    label?: string;
    color?: string;
    dashed?: boolean;
}
export interface FlowTheme {
    fontFamily?: string;
    fontSize?: number;
    nodePadding?: {
        x: number;
        y: number;
    };
    nodeRadius?: number;
    nodeBorderWidth?: number;
    edgeWidth?: number;
    arrowSize?: number;
    colors?: {
        background?: string;
        text?: string;
        border?: string;
        edge?: string;
        edgeLabel?: string;
        input?: string;
        output?: string;
        action?: string;
        decision?: string;
        process?: string;
        classifier?: string;
    };
    direction?: "DOWN" | "RIGHT";
}
export interface FlowConfig {
    title?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    theme?: FlowTheme;
}
export interface LayoutNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    node: FlowNode;
}
export interface LayoutEdge {
    id: string;
    points: {
        x: number;
        y: number;
    }[];
    edge: FlowEdge;
    labelPosition?: {
        x: number;
        y: number;
    };
}
export interface LayoutResult {
    width: number;
    height: number;
    nodes: LayoutNode[];
    edges: LayoutEdge[];
}
//# sourceMappingURL=types.d.ts.map