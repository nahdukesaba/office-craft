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

  function stepHour(nh: number) {
    onChange(`${String(nh).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  function setHour(nh: number) {
    stepHour(nh);
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
            aria-label="Hour"
            aria-pressed={mode === "hour"}
            onClick={() => setMode("hour")}
            className={cn("rounded px-2 py-0.5 transition-colors", mode === "hour" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {String(h).padStart(2, "0")}
          </button>
          <span>:</span>
          <button
            type="button"
            aria-label="Minute"
            aria-pressed={mode === "minute"}
            onClick={() => setMode("minute")}
            className={cn("rounded px-2 py-0.5 transition-colors", mode === "minute" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
          >
            {String(m).padStart(2, "0")}
          </button>
        </div>
        {mode === "hour" ? (
          <ClockDial
            label="Hour"
            outer={Array.from({ length: 12 }, (_, i) => i)}
            inner={Array.from({ length: 12 }, (_, i) => i + 12)}
            selected={h}
            onSelect={setHour}
            onStep={stepHour}
            format={(n) => String(n).padStart(2, "0")}
          />
        ) : (
          <ClockDial
            label="Minute"
            outer={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]}
            selected={m}
            onSelect={setMinute}
            onStep={setMinute}
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
  label,
  outer,
  inner,
  selected,
  onSelect,
  onStep,
  format,
}: {
  label: string;
  outer: number[];
  inner?: number[];
  selected: number;
  onSelect: (n: number) => void;
  onStep: (n: number) => void;
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
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  const selectedOnOuter = outer.includes(selected);
  const list = selectedOnOuter ? outer : inner ?? outer;
  const idx = list.indexOf(selected);
  const r = selectedOnOuter ? rOuter : rInner;
  const handLength = idx >= 0 ? r : 0;
  const targetAngle = idx >= 0 ? (idx / list.length) * 360 : 0;
  const angleRef = useRef(targetAngle);
  // Sweep the short way round, so 55 to 00 moves forward instead of unwinding the dial.
  const turn = (((targetAngle - angleRef.current) % 360) + 540) % 360 - 180;
  const angle = angleRef.current + turn;
  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  function onKeyDown(e: React.KeyboardEvent) {
    const values = inner ? [...outer, ...inner] : outer;
    const dir = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (dir) {
      e.preventDefault();
      const at = Math.max(values.indexOf(selected), 0);
      onStep(values[(at + dir + values.length) % values.length]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(selected);
    }
  }

  return (
    <svg
      ref={ringRef}
      width={size}
      height={size}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={Math.min(...outer, ...(inner ?? []))}
      aria-valuemax={Math.max(...outer, ...(inner ?? []))}
      aria-valuenow={selected}
      aria-valuetext={format(selected)}
      className="mx-auto touch-none select-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onKeyDown={onKeyDown}
      // The hour dial advances to minutes on first pick, so a held pointer must not carry over and change the minute.
      onPointerDown={(e) => { setDragging(!inner); fromPointer(e); }}
      onPointerMove={(e) => dragging && fromPointer(e)}
    >
      <circle cx={cx} cy={cy} r={rOuter + 12} className="fill-muted" />
      <circle cx={cx} cy={cy} r={3} className="fill-primary" />
      <g
        className={cn(!dragging && "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]")}
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        <line x1={cx} y1={cy} x2={cx} y2={cy - handLength} className="stroke-primary" strokeWidth={2} />
        <circle cx={cx} cy={cy - handLength} r={14} className="fill-primary" />
      </g>
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