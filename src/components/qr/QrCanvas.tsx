"use client";

import { useEffect, useRef, useState } from "react";
import { buildStylingOptions, type QrStylingConstructor, type QrStylingInstance } from "@/lib/qr-style";
import type { QRStyle } from "@/lib/types";

export type QrCanvasHandle = {
  getInstance: () => QrStylingInstance | null;
};

export function QrCanvas({
  data,
  style,
  renderSize = 320,
  className = "",
  onInstance,
  onStatusChange,
}: {
  data: string;
  style: QRStyle;
  renderSize?: number;
  className?: string;
  onInstance?: (instance: QrStylingInstance | null) => void;
  onStatusChange?: (status: "loading" | "ready" | "error") => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<QrStylingInstance | null>(null);
  const callbackRef = useRef(onInstance);
  const latest = useRef({ data, style, renderSize });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const logoKey = style.logo ? "with-logo" : "no-logo";

  callbackRef.current = onInstance;
  latest.current = { data, style, renderSize };

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // (Re)create the renderer. Recreating when the logo toggles guarantees the
  // embedded image is cleared — deep-merge updates can keep a stale logo.
  useEffect(() => {
    let disposed = false;

    (async () => {
      try {
        const mod = (await import("qr-code-styling")) as unknown as { default: QrStylingConstructor };
        const Ctor = mod.default ?? (mod as unknown as QrStylingConstructor);
        if (disposed || !hostRef.current) return;
        const { data: currentData, style: currentStyle, renderSize: currentSize } = latest.current;
        const instance = new Ctor(buildStylingOptions(currentStyle, currentData, currentSize));
        hostRef.current.replaceChildren();
        instance.append(hostRef.current);
        instanceRef.current = instance;
        callbackRef.current?.(instance);
        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      instanceRef.current = null;
      callbackRef.current?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoKey]);

  const styleKey = JSON.stringify(style);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    try {
      instance.update(buildStylingOptions(style, data, renderSize) as Record<string, unknown>);
    } catch {
      /* renderer not ready */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, styleKey, renderSize]);

  return (
    <div className={className}>
      {status === "loading" && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-volt-400" />
        </div>
      )}
      {status === "error" && (
        <div className="p-4 text-center font-mono text-[11px] text-coral-400">renderer unavailable</div>
      )}
      <div
        ref={hostRef}
        className="[&>canvas]:!h-auto [&>canvas]:!w-full [&>canvas]:max-w-full [&>svg]:!h-auto [&>svg]:!w-full"
      />
    </div>
  );
}
