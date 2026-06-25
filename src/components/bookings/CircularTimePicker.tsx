import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "hour" | "minute";

/**
 * Circular (clock-face) 24h time picker.
 * - Hours: outer ring 0-11, inner ring 12-23.
 * - Minutes: step 5.
 */
export function CircularTimePicker({
  value,
  onChange,
  label,
  id,
}: {
  value: string; // HH:mm
  onChange: (v: string) => void;
  label?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("hour");
  const [h, m] = useMemo(() => {
    const [hh, mm] = value.split(":").map(Number);
    return [isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm];
  }, [value]);

  function setHour(nh: number) {
    onChange(`${String(nh).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    setMode("minute");
  }
  function setMinute(nm: number) {
    onChange(`${String(h).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setMode("hour"); }}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className="w-full justify-start font-mono">
          <Clock className="mr-2 size-4 opacity-70" />
          {value || "--:--"}
          {label && <span className="ml-auto text-xs text-muted-foreground">{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="mb-3 flex items-center justify-center gap-1 text-2xl font-semibold">
          <button
            type="button"
            onClick={() => setMode("hour")}
            className={cn("rounded px-2 py-0.5", mode === "hour" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {String(h).padStart(2, "0")}
          </button>
          <span>:</span>
          <button
            type="button"
            onClick={() => setMode("minute")}
            className={cn("rounded px-2 py-0.5", mode === "minute" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {String(m).padStart(2, "0")}
          </button>
        </div>
        {mode === "hour" ? (
          <ClockDial
            outer={Array.from({ length: 12 }, (_, i) => i)}
            inner={Array.from({ length: 12 }, (_, i) => i + 12)}
            selected={h}
            onSelect={setHour}
            format={(n) => String(n).padStart(2, "0")}
          />
        ) : (
          <ClockDial
            outer={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]}
            selected={m}
            onSelect={setMinute}
            format={(n) => String(n).padStart(2, "0")}
          />
        )}
        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ClockDial({
  outer,
  inner,
  selected,
  onSelect,
  format,
}: {
  outer: number[];
  inner?: number[];
  selected: number;
  onSelect: (n: number) => void;
  format: (n: number) => string;
}) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 92;
  const rInner = 60;
  const ringRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function pos(r: number, idx: number, total: number) {
    const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function fromPointer(e: React.PointerEvent) {
    const svg = ringRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const dist = Math.hypot(x, y);
    const ring = inner && dist < (rOuter + rInner) / 2 ? "inner" : "outer";
    const list = ring === "inner" && inner ? inner : outer;
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const idx = Math.round((angle / (Math.PI * 2)) * list.length) % list.length;
    onSelect(list[idx]);
  }

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragging]);

  const selectedOnOuter = outer.includes(selected);
  const list = selectedOnOuter ? outer : inner ?? outer;
  const idx = list.indexOf(selected);
  const r = selectedOnOuter ? rOuter : rInner;
  const handPos = idx >= 0 ? pos(r, idx, list.length) : { x: cx, y: cy };

  return (
    <svg
      ref={ringRef}
      width={size}
      height={size}
      className="mx-auto touch-none select-none"
      onPointerDown={(e) => { setDragging(true); fromPointer(e); }}
      onPointerMove={(e) => dragging && fromPointer(e)}
    >
      <circle cx={cx} cy={cy} r={rOuter + 12} className="fill-muted" />
      <line x1={cx} y1={cy} x2={handPos.x} y2={handPos.y} className="stroke-primary" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={3} className="fill-primary" />
      <circle cx={handPos.x} cy={handPos.y} r={14} className="fill-primary" />
      {outer.map((n, i) => {
        const p = pos(rOuter, i, outer.length);
        const isSel = n === selected;
        return (
          <text
            key={`o-${n}`}
            x={p.x}
            y={p.y}
            dy="0.35em"
            textAnchor="middle"
            className={cn("cursor-pointer text-[12px] font-medium", isSel ? "fill-primary-foreground" : "fill-foreground")}
            onClick={() => onSelect(n)}
          >
            {format(n)}
          </text>
        );
      })}
      {inner?.map((n, i) => {
        const p = pos(rInner, i, inner.length);
        const isSel = n === selected;
        return (
          <text
            key={`i-${n}`}
            x={p.x}
            y={p.y}
            dy="0.35em"
            textAnchor="middle"
            className={cn("cursor-pointer text-[10px]", isSel ? "fill-primary-foreground" : "fill-muted-foreground")}
            onClick={() => onSelect(n)}
          >
            {format(n)}
          </text>
        );
      })}
    </svg>
  );
}