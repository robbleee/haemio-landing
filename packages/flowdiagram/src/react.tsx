import { useState, useEffect } from "react";
import type { FlowConfig } from "./types.js";
import { flowToSVG } from "./index.js";

interface FlowDiagramProps {
  config: FlowConfig;
  className?: string;
  style?: React.CSSProperties;
}

export function FlowDiagram({ config, className, style }: FlowDiagramProps) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    flowToSVG(config).then((result) => {
      if (!cancelled) setSvg(result);
    });
    return () => {
      cancelled = true;
    };
  }, [config]);

  if (!svg) return null;

  return (
    <div
      className={className}
      style={{ ...style, width: "100%", overflow: "auto" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
