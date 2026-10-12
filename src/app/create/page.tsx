import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { StudioClient } from "@/components/qr/StudioClient";
import { getCurrentUser } from "@/lib/auth";
import { contentTypeMap, contentTypes } from "@/lib/content";
import { findVisibleCode, serializeCode } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR Studio — create a custom QR code",
  description:
    "Generate static or dynamic QR codes with 20 content types, gradients, logo embeds, brand frames and PNG/SVG/JPEG/PDF exports.",
};

export function generateStaticParams() {
  return [];
}

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; id?: string; v?: string }>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const requestedKind = params.kind && contentTypes.some((t) => t.id === params.kind) ? params.kind : undefined;

  let initialCode = null;
  if (params.id) {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
    const proto = headerList.get("x-forwarded-proto") ?? "http";
    const row = await findVisibleCode(params.id);
    initialCode = row ? serializeCode(row, `${proto}://${host}`) : null;
  }

  // Prefill from a decoded payload (the /scan tool links here with ?kind=&v=).
  let kind = requestedKind;
  let initialValues: Record<string, string> | undefined;
  if (!initialCode && params.v) {
    const raw = params.v;
    const candidate = requestedKind ? contentTypeMap[requestedKind] : null;
    const single = candidate && candidate.fields.length === 1 ? candidate.fields[0] : null;
    if (single && candidate) {
      initialValues = { [single.id]: raw };
    } else if (/^https?:\/\//i.test(raw)) {
      kind = "url";
      initialValues = { url: raw };
    } else {
      kind = "text";
      initialValues = { text: raw };
    }
  }

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <StudioClient
        initialKind={kind}
        initialValues={initialValues}
        initialCode={initialCode}
        user={user ? { name: user.name, email: user.email } : null}
      />
    </>
  );
}
