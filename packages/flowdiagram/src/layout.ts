import ELK from "elkjs/lib/elk.bundled.js";
import type { FlowConfig, LayoutResult, LayoutNode, LayoutEdge } from "./types.js";
import { resolveTheme } from "./theme.js";
import { measureNode } from "./measure.js";

const elk = new ELK();

export async function computeLayout(config: FlowConfig): Promise<LayoutResult> {
  const theme = resolveTheme(config.theme);
  const isHorizontal = theme.direction === "RIGHT";

  // Measure all nodes
  const measurements = new Map<string, ReturnType<typeof measureNode>>();
  for (const node of config.nodes) {
    measurements.set(node.id, measureNode(node, theme));
  }

  // Build ELK graph
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": isHorizontal ? "RIGHT" : "DOWN",
      "elk.spacing.nodeNode": "40",
      "elk.layered.spacing.nodeNodeBetweenLayers": "60",
      "elk.layered.spacing.edgeNodeBetweenLayers": "30",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.padding": "[top=40,left=40,bottom=40,right=40]",
    },
    children: config.nodes.map((node) => {
      const m = measurements.get(node.id)!;
      return {
        id: node.id,
        width: m.width,
        height: m.height,
      };
    }),
    edges: config.edges.map((edge, i) => ({
      id: `e${i}`,
      sources: [edge.from],
      targets: [edge.to],
    })),
  };

  const layout = await elk.layout(elkGraph);

  // Map ELK result back to our types
  const layoutNodes: LayoutNode[] = (layout.children ?? []).map((child) => {
    const node = config.nodes.find((n) => n.id === child.id)!;
    return {
      id: child.id,
      x: child.x ?? 0,
      y: child.y ?? 0,
      width: child.width ?? 0,
      height: child.height ?? 0,
      node,
    };
  });

  const layoutEdges: LayoutEdge[] = (layout.edges ?? []).map((elkEdge, i) => {
    const edge = config.edges[i];
    const sections = (elkEdge as any).sections ?? [];
    const points: { x: number; y: number }[] = [];

    for (const section of sections) {
      if (section.startPoint) points.push(section.startPoint);
      if (section.bendPoints) points.push(...section.bendPoints);
      if (section.endPoint) points.push(section.endPoint);
    }

    // Compute label position at midpoint of the edge
    let labelPosition: { x: number; y: number } | undefined;
    if (edge.label && points.length >= 2) {
      const mid = Math.floor(points.length / 2);
      const a = points[mid - 1];
      const b = points[mid];
      labelPosition = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    return {
      id: elkEdge.id,
      points,
      edge,
      labelPosition,
    };
  });

  return {
    width: layout.width ?? 800,
    height: layout.height ?? 600,
    nodes: layoutNodes,
    edges: layoutEdges,
  };
}
