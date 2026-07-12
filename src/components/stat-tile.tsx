"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { Card } from "./ui/card";

const EASE = [0.22, 1, 0.36, 1] as const;

export function StatTile({
  label,
  value,
  sub,
  icon,
  index = 0,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
    >
      <Card className="h-full p-5">
        <div className="flex items-center gap-2 text-sm text-muted">
          {icon}
          {label}
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-faint">{sub}</p>}
      </Card>
    </motion.div>
  );
}
