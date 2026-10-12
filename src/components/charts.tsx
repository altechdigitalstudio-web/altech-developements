"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setInView(true), observer.disconnect())),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

export function AreaChart({
  series,
  height = 180,
  stroke = "#2563eb",
  fillFrom = "rgba(37,99,235,0.22)",
  fillTo = "rgba(37,99,235,0.01)",
  valueSuffix = "",
}: {
  series: { label: string; count: number }[];
  height?: number;
  stroke?: string;
  fillFrom?: string;
  fillTo?: string;
  valueSuffix?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const width = 720;
  const pad = 8;
  const max = Math.max(1, ...series.map((p) => p.count));

  const points = useMemo(
    () =>
      series.map((point, index) => {
        const x = pad + (index * (width - pad * 2)) / Math.max(1, series.length - 1);
        const y = height - pad - (point.count / max) * (height - pad * 2.5);
        return { x, y, ...point };
      }),
    [series, max, height],
  );

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1]?.x ?? 0},${height} L${points[0]?.x ?? 0},${height} Z`;
  const pathLength = 2600;

  return (
    <div ref={ref} className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible select-none"
        preserveAspectRatio="none"
        role="img"
        aria-label="Scans over time"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="areaFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom} />
            <stop offset="100%" stopColor={fillTo} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={0}
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="4 6"
          />
        ))}
        <path d={area} fill="url(#areaFillGrad)" opacity={inView ? 1 : 0} style={{ transition: "opacity 0.8s ease 0.2s" }} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={inView ? 0 : pathLength}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
        {points.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 2.5}
              fill={hover === i ? stroke : "#ffffff"}
              stroke={stroke}
              strokeWidth={2}
              opacity={inView ? 1 : 0}
              style={{ transition: `opacity .3s ease ${0.3 + i * 0.01}s, r .15s ease` }}
            />
            <rect
              x={p.x - (width / Math.max(1, series.length)) * 0.5}
              y={0}
              width={width / Math.max(1, series.length)}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}
      </svg>
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-center shadow-lg"
          style={{ left: `${(points[hover].x / width) * 100}%` }}
        >
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{points[hover].label}</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {points[hover].count}
            {valueSuffix}
          </div>
        </div>
      )}
    </div>
  );
}

export function BarList({
  items,
  color = "#2563eb",
  emptyLabel = "No data yet",
}: {
  items: { label: string; count: number; meta?: string }[];
  color?: string;
  emptyLabel?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(1, ...items.map((i) => i.count));
  const total = items.reduce((sum, i) => sum + i.count, 0);

  if (!items.length) return <p className="py-6 text-center text-xs text-slate-400">{emptyLabel}</p>;

  return (
    <div ref={ref} className="space-y-2.5">
      {items.map((item, index) => (
        <div key={item.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
            <span className="shrink-0 font-mono text-xs text-slate-600 dark:text-slate-400">
              {item.count}
              <span className="ml-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
                {total ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out group-hover:brightness-110"
              style={{
                width: inView ? `${(item.count / max) * 100}%` : "0%",
                transitionDelay: `${index * 50}ms`,
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  items,
  size = 160,
}: {
  items: { label: string; count: number; color: string }[];
  size?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const total = Math.max(1, items.reduce((sum, i) => sum + i.count, 0));
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={13}
          />
          {items.map((item, index) => {
            const length = (item.count / total) * circumference;
            const dash = inView ? `${length} ${circumference - length}` : `0 ${circumference}`;
            const currentOffset = offset;
            offset += length;
            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={13}
                strokeLinecap="butt"
                strokeDasharray={dash}
                strokeDashoffset={-currentOffset}
                style={{ transition: `stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{total.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">scans</div>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: item.color }} />
            <span className="flex-1 truncate text-slate-600 dark:text-slate-400">{item.label}</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">
              {Math.round((item.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HourHeat({ hours, labels = ["00", "06", "12", "18", "24"] }: { hours: number[]; labels?: string[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(1, ...hours);
  return (
    <div ref={ref}>
      <div className="flex h-16 items-end gap-[3px]">
        {hours.map((value, index) => (
          <div
            key={index}
            title={`${String(index).padStart(2, "0")}:00 — ${value} scans`}
            className="flex-1 rounded-t-[3px] transition-all duration-500 ease-out hover:brightness-125"
            style={{
              height: inView ? `${Math.max(8, (value / max) * 100)}%` : "8%",
              transitionDelay: `${index * 15}ms`,
              background: value === 0 ? "rgba(148,163,184,0.15)" : `rgba(37,99,235,${0.3 + (value / max) * 0.7})`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  delta,
  icon,
  accent = "#2563eb",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card-lift group relative overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="mt-2.5 text-2xl font-bold tracking-tight text-main font-mono">{value}</div>
      {delta && <div className="mt-1.5 text-xs text-muted">{delta}</div>}
    </div>
  );
}
