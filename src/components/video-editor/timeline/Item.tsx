import { useItem } from "dnd-timeline";
import type { Span } from "dnd-timeline";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemProps {
  id: string;
  span: Span;
  rowId: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  zoomDepth: number;
}

// Map zoom depth to multiplier labels
const ZOOM_LABELS: Record<number, string> = {
  1: "1.25×",
  2: "1.5×",
  3: "1.8×",
  4: "2.2×",
  5: "3.5×",
};

export default function Item({ id, span, rowId, isSelected = false, onSelect, zoomDepth }: ItemProps) {
  const { setNodeRef, attributes, listeners, itemStyle, itemContentStyle } = useItem({
    id,
    span,
    data: { rowId },
  });

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      {...listeners}
      {...attributes}
      onPointerDownCapture={() => onSelect?.()}
      className="group"
    >
      <div style={itemContentStyle}>
        <div
          className={cn(
            "w-full h-full overflow-hidden flex items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing relative rounded-md backdrop-blur-sm transition-all",
            isSelected
              ? "bg-white/20 border border-white"
              : "bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/20"
          )}
          style={{ height: 48 }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.();
          }}
        >
          <div className={cn("absolute top-0 bottom-0 w-1 bg-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity left-0 rounded-l-md", isSelected && 'opacity-100')} />
          <div className={cn("absolute top-0 bottom-0 w-1 bg-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity right-0 rounded-r-md", isSelected && 'opacity-100')} />
          
          <div className="relative z-10 flex items-center gap-1.5 text-white/90 opacity-80 group-hover:opacity-100 transition-opacity select-none">
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold tracking-tight">
              {ZOOM_LABELS[zoomDepth] || `${zoomDepth}×`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}