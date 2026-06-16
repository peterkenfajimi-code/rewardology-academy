"use client";

import { useEffect, useState } from "react";

export function DashboardProgressFill({ pct }: { pct: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(Math.round(pct * 100)));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return <div className="db-progress-fill" style={{ width: `${width}%` }} />;
}
