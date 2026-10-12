import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, scans } from "@/db/schema";
import { countryCode, parseUserAgent, referrerLabel } from "@/lib/device";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell(title: string, body: string, accent = "#2563eb"): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escape(title)} · Altech Hub QR</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box}
  :root {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #475569;
    --dim: #94a3b8;
    --btn: #0f172a;
    --btn-text: #ffffff;
    --row-bg: #f8fafc;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #06070a;
      --card: #0e1016;
      --border: #212734;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --dim: #64748b;
      --btn: #2563eb;
      --btn-text: #ffffff;
      --row-bg: #0a0c11;
    }
  }
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--text);
       font-family:"Plus Jakarta Sans",-apple-system,system-ui,sans-serif;padding:24px}
  .card{max-width:440px;width:100%;border:1px solid var(--border);border-radius:24px;background:var(--card);padding:32px 26px;
        box-shadow:0 10px 40px -10px rgba(0,0,0,0.1)}
  .center{text-align:center}
  .badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.08em;
         text-transform:uppercase;color:${accent};border:1px solid var(--border);background:var(--row-bg);
         padding:5px 12px;border-radius:999px}
  h1{font-size:22px;font-weight:800;margin:18px 0 6px;letter-spacing:-.02em;line-height:1.2}
  p{color:var(--muted);font-size:13.5px;line-height:1.6;margin:0}
  .row{display:flex;align-items:center;gap:12px;border:1px solid var(--border);border-radius:12px;background:var(--row-bg);padding:10px 12px;margin-top:8px}
  .row .k{font-size:11px;font-weight:600;text-transform:uppercase;color:var(--dim);width:75px;flex-shrink:0}
  .row .v{flex:1;min-width:0;font-size:13px;font-weight:600;word-break:break-word;color:var(--text)}
  .copy{flex-shrink:0;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:8px;padding:6px 10px;
        font-size:11px;font-weight:600;cursor:pointer;transition:.15s}
  .copy:hover{border-color:var(--text)}
  a.btn, button.btn{display:inline-block;margin-top:20px;padding:12px 22px;border-radius:12px;background:var(--btn);color:var(--btn-text);
        font-weight:700;text-decoration:none;font-size:13px;border:0;cursor:pointer;font-family:inherit}
  a.ghost{display:inline-block;margin-top:10px;padding:10px 18px;border-radius:12px;border:1px solid var(--border);color:var(--text);
        text-decoration:none;font-size:12.5px;font-weight:600}
  footer{margin-top:24px;text-align:center;font-size:11px;color:var(--dim)}
</style></head>
<body><div class="card">${body}<footer>Altech Hub QR Studio · qr.altech.hub</footer></div>
<script>
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-copy]');if(!b)return;
    var text=b.getAttribute('data-copy');
    navigator.clipboard.writeText(text).then(function(){
      var old=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=old},1400);
    });
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-file]');if(!b)return;
    var blob=new Blob([b.getAttribute('data-file')],{type:b.getAttribute('data-type')||'text/plain'});
    var url=URL.createObjectURL(blob);var a=document.createElement('a');
    a.href=url;a.download=b.getAttribute('data-name')||'download.txt';a.click();
    setTimeout(function(){URL.revokeObjectURL(url)},3000);
  });
</script>
</body></html>`;
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

function parseWifi(payload: string) {
  const body = payload.replace(/^WIFI:/i, "").replace(/;;$/, "");
  const out: Record<string, string> = {};
  body.split(/;(?!\\)/).forEach((part) => {
    const idx = part.indexOf(":");
    if (idx > 0) out[part.slice(0, idx).trim().toUpperCase()] = part.slice(idx + 1).replace(/\\([;,:"\\])/g, "$1");
  });
  return out;
}

function parseVCard(payload: string) {
  const out: Record<string, string> = {};
  payload.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx <= 0) return;
    const key = line.slice(0, idx).split(";")[0].trim().toUpperCase();
    out[key] = line.slice(idx + 1).trim();
  });
  return out;
}

function parseVEvent(payload: string) {
  const out: Record<string, string> = {};
  payload.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx <= 0) return;
    out[line.slice(0, idx).trim().toUpperCase()] = line.slice(idx + 1).trim();
  });
  return out;
}

const prettyDate = (raw: string) => {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(raw ?? "");
  if (!match) return raw || "—";
  const [, y, m, d, hh, mm] = match;
  return hh ? `${y}-${m}-${d} ${hh}:${mm}` : `${y}-${m}-${d}`;
};

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const rows = await db.select().from(qrCodes).where(eq(qrCodes.slug, slug)).limit(1);
  const code = rows[0];

  if (!code) {
    return shell(
      "Retired Code",
      `<div class="center"><span class="badge">Notice</span>
       <h1>This QR code has been retired</h1>
       <p>The QR code you scanned is no longer active. You can generate a fresh code in the QR Studio.</p>
       <a class="btn" href="/create">Open QR Studio</a></div>`,
    );
  }

  if (code.status === "paused") {
    return shell(
      "Temporarily Paused",
      `<div class="center"><span class="badge" style="color:#ef4444;border-color:rgba(239,68,68,0.25)">Temporarily Paused</span>
       <h1>${escape(code.name)} is Paused</h1>
       <p>This QR campaign has been paused by the owner. Please check back later or contact the campaign manager.</p>
       <a class="btn" href="/dashboard">Workspace</a></div>`,
      "#ef4444",
    );
  }

  const destination = code.isDynamic ? code.destination || code.value : code.value;

  try {
    const headers = req.headers;
    const geo = countryCode(headers, headers.get("x-forwarded-for"));
    const device = parseUserAgent(headers.get("user-agent") ?? "");

    await db.insert(scans).values({
      qrCodeId: code.id,
      country: geo.code,
      city: geo.city || null,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      language: (headers.get("accept-language") ?? "").split(",")[0]?.slice(0, 12) || null,
      referrer: referrerLabel(headers.get("referer")),
    });
    await db
      .update(qrCodes)
      .set({ scans: sql`${qrCodes.scans} + 1`, lastScanAt: new Date() })
      .where(eq(qrCodes.id, code.id));
  } catch (error) {
    console.error("scan tracking failed", error);
  }

  // Non-URL payloads get a clean structured landing interface
  if (/^WIFI:/i.test(destination)) {
    const wifi = parseWifi(destination);
    const security = wifi.T === "nopass" ? "Open Network" : wifi.T === "WEP" ? "WEP" : "WPA / WPA2 / WPA3";
    return shell(
      wifi.S || "Wi-Fi Network",
      `<div class="center"><span class="badge">Wi-Fi Network</span>
       <h1>Connect to ${escape(wifi.S || "Wi-Fi")}</h1>
       <p>Use the credentials below to connect to the network.</p></div>
       <div class="row"><span class="k">SSID</span><span class="v">${escape(wifi.S || "—")}</span>
         <button class="copy" data-copy="${escape(wifi.S || "")}">Copy</button></div>
       <div class="row"><span class="k">Password</span><span class="v">${escape(wifi.P || "None")}</span>
         <button class="copy" data-copy="${escape(wifi.P || "")}">Copy</button></div>
       <div class="row"><span class="k">Security</span><span class="v">${escape(security)}</span></div>
       <div class="center"><a class="btn" href="/create?kind=wifi">Create Wi-Fi QR</a></div>`,
    );
  }

  if (/^BEGIN:VCARD/i.test(destination)) {
    const card = parseVCard(destination);
    const rowsHtml = [
      ["phone", card.TEL],
      ["email", card.EMAIL],
      ["company", card.ORG],
      ["title", card.TITLE],
      ["website", card.URL],
      ["address", card.ADR?.replace(/;;+/g, " · ").replace(/^·\s*/, "")],
      ["note", card.NOTE],
    ]
      .filter(([, value]) => Boolean(value))
      .map(
        ([key, value]) =>
          `<div class="row"><span class="k">${escape(String(key))}</span><span class="v">${escape(
            String(value),
          )}</span><button class="copy" data-copy="${escape(String(value))}">Copy</button></div>`,
      )
      .join("");
    return shell(
      card.FN || "Contact Card",
      `<div class="center"><span class="badge">Digital Business Card</span>
       <h1>${escape(card.FN || "Contact Card")}</h1>
       <p>Save contact details directly to your phone.</p></div>
       ${rowsHtml}
       <div class="center">
         <button class="btn" data-file="${escape(destination)}" data-type="text/vcard" data-name="${escape(
           (card.FN || "contact").replace(/\s+/g, "-").toLowerCase(),
         )}.vcf">Download Contact (.vcf)</button>
         <br/><a class="ghost" href="/create?kind=vcard">Create Your Card</a></div>`,
    );
  }

  if (/^BEGIN:VCALENDAR|^BEGIN:VEVENT/i.test(destination)) {
    const event = parseVEvent(destination);
    const rowsHtml = [
      ["starts", prettyDate(event.DTSTART)],
      ["ends", prettyDate(event.DTEND)],
      ["location", event.LOCATION],
      ["details", event.DESCRIPTION],
    ]
      .filter(([, value]) => Boolean(value))
      .map(
        ([key, value]) =>
          `<div class="row"><span class="k">${escape(String(key))}</span><span class="v">${escape(String(value))}</span></div>`,
      )
      .join("");
    return shell(
      event.SUMMARY || "Calendar Event",
      `<div class="center"><span class="badge">Event Invitation</span>
       <h1>${escape(event.SUMMARY || "Event")}</h1>
       <p>Download the .ics file to add this event to your calendar.</p></div>
       ${rowsHtml}
       <div class="center">
         <button class="btn" data-file="${escape(destination)}" data-type="text/calendar" data-name="event.ics">Download Event (.ics)</button>
         <br/><a class="ghost" href="/create?kind=event">Create Event QR</a></div>`,
    );
  }

  let normalized = destination;
  if (/^SMSTO:/i.test(destination)) {
    const rest = destination.slice(6);
    const idx = rest.indexOf(":");
    const number = idx >= 0 ? rest.slice(0, idx) : rest;
    const message = idx >= 0 ? rest.slice(idx + 1) : "";
    normalized = message ? `sms:${number}?body=${encodeURIComponent(message)}` : `sms:${number}`;
  }

  if (/^(https?:|mailto:|tel:|sms:|geo:)/i.test(normalized)) {
    return new Response(null, {
      status: 302,
      headers: { location: normalized, "cache-control": "no-store, max-age=0" },
    });
  }

  return shell(
    code.name,
    `<div class="center"><span class="badge">Data Payload</span>
     <h1>${escape(code.name)}</h1>
     <p>This code contains raw text or custom payload.</p></div>
     <div class="row"><span class="k">Payload</span><span class="v" style="font-family:'JetBrains Mono',monospace;font-size:12px">${escape(
       destination,
     )}</span></div>
     <div class="center"><button class="btn" data-copy="${escape(destination)}">Copy Payload</button></div>`,
  );
}
