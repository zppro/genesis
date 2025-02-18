import { Eraser, Stamp } from "lucide-react";

export const opValues = ["stamp", "eraser"] as const
export type OpValue = typeof opValues[number]
export function renderOpIcon(v: OpValue) {
  switch (v) {
    case 'stamp':
      return <Stamp className="h-4 w-4" />;
    case 'eraser':
      return <Eraser className="h-4 w-4" />;
    default:
      return null;
  }
}