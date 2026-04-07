import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { flowToSVG } from "./index.js";
export function FlowDiagram({ config, className, style }) {
    const [svg, setSvg] = useState("");
    useEffect(() => {
        let cancelled = false;
        flowToSVG(config).then((result) => {
            if (!cancelled)
                setSvg(result);
        });
        return () => {
            cancelled = true;
        };
    }, [config]);
    if (!svg)
        return null;
    return (_jsx("div", { className: className, style: { ...style, width: "100%", overflow: "auto" }, dangerouslySetInnerHTML: { __html: svg } }));
}
//# sourceMappingURL=react.js.map