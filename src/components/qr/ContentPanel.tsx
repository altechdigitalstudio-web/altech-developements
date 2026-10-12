"use client";

import { useMemo, useState } from "react";
import { contentTypes } from "@/lib/content";
import type { ContentTypeDef, FieldDef } from "@/lib/types";
import { IconSearch, kindIcon } from "@/components/icons";

const GROUPS: { id: ContentTypeDef["group"]; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Social" },
  { id: "utility", label: "Utility" },
  { id: "commerce", label: "Commerce" },
];

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = `f-${field.id}`;
  return (
    <div className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-mist">
        {field.label}
        {field.required && <span className="text-volt-400">*</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          className="input-base min-h-[92px] resize-y font-mono text-[12.5px]"
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select id={id} className="input-base" value={value} onChange={(e) => onChange(e.target.value)}>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-ink-850">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === "datetime-local" ? "datetime-local" : field.type}
          className="input-base font-mono text-[12.5px]"
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && <p className="mt-1.5 text-[11px] text-mist-dim">{field.hint}</p>}
    </div>
  );
}

export function ContentPanel({
  kind,
  onKindChange,
  values,
  onValuesChange,
}: {
  kind: string;
  onKindChange: (kind: string) => void;
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<ContentTypeDef["group"] | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contentTypes.filter((t) => {
      const matchesGroup = group === "all" || t.group === group;
      const matchesQuery = !q || `${t.label} ${t.blurb}`.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [query, group]);

  const active = contentTypes.find((t) => t.id === kind) ?? contentTypes[0];
  const ActiveIcon = kindIcon[active.id] ?? kindIcon.url;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-main">1. Content Type</h2>
          <span className="text-xs font-medium text-muted">{contentTypes.length} types</span>
        </div>
        <div className="relative mt-3">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input
            className="input-base pl-9"
            placeholder="Search QR formats…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {(["all", ...GROUPS.map((g) => g.id)] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g as typeof group)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                group === g
                  ? "border-blue-600 bg-blue-50 dark:bg-volt-400/15 text-blue-700 dark:text-volt-300 font-bold"
                  : "border-line text-muted hover:border-slate-300 dark:hover:border-slate-700 hover:text-main"
              }`}
            >
              {g === "all" ? "All" : GROUPS.find((x) => x.id === g)?.label ?? g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-h-[240px] shrink-0 grid-cols-2 gap-1.5 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((type) => {
          const Icon = kindIcon[type.id] ?? kindIcon.url;
          const isActive = type.id === kind;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                onKindChange(type.id);
                onValuesChange({ ...type.defaults });
              }}
              className={`group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                isActive
                  ? "border-volt-400/70 bg-volt-400/10"
                  : "border-line bg-ink-850/60 hover:-translate-y-0.5 hover:border-ink-600"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${
                  isActive
                    ? "border-volt-400/60 bg-volt-400/15 text-volt-300"
                    : "border-line bg-ink-900 text-mist group-hover:text-chalk"
                }`}
              >
                <Icon width={16} height={16} />
              </span>
              <span className="min-w-0">
                <span className={`block truncate text-[12.5px] font-semibold ${isActive ? "text-chalk" : "text-mist"}`}>
                  {type.label}
                </span>
                <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-mist-dim">
                  {type.group}
                </span>
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-mist-dim">No QR type matches “{query}”.</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-line px-4 pb-5 pt-4">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-line bg-card-subtle p-3.5">
          <span className="mt-0.5 text-blue-600 dark:text-volt-400">
            <ActiveIcon width={18} height={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-main">{active.label}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{active.blurb}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {active.fields.map((field) => (
            <Field
              key={field.id}
              field={field}
              value={values[field.id] ?? ""}
              onChange={(next) => onValuesChange({ ...values, [field.id]: next })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
