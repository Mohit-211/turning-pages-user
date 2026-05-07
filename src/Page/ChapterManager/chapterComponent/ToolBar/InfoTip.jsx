import React from "react";
import { Tooltip } from "antd";
import { Info } from "lucide-react";

export default function InfoTip({ text, position = "top" }) {
  return (
    <Tooltip title={text} placement={position}>
      <span className="imp-info-tip" tabIndex={0} aria-label="More information">
        <Info size={12} />
      </span>
    </Tooltip>
  );
}
