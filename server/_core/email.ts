import { ENV } from "./env";

const RESEND_API = "https://api.resend.com/emails";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function publicAppUrl(path: string): string {
  const base = ENV.appPublicUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export type SendOpportunityEmailParams = {
  to: string;
  recipientName: string | null;
  opportunityTitle: string;
  organizer: string;
  message: string;
  opportunityId: number;
  description?: string | null;
  deadline?: string | Date | null;
  mode?: string | null;
  funding?: string | null;
  fee?: string | null;
  opportunityType?: string | null;
  fields?: string[];
  applicationLink?: string | null;
};

/**
 * Sends a transactional email via Resend (https://resend.com).
 * Requires RESEND_API_KEY and EMAIL_FROM in server environment.
 */
export async function sendOpportunityEmailToUser(
  params: SendOpportunityEmailParams
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ENV.resendApiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }
  if (!ENV.emailFrom) {
    return { ok: false, error: "EMAIL_FROM is not configured" };
  }

  const subject = `NATTA — ${params.opportunityTitle}`.slice(0, 998);

  const safeTitle = escapeHtml(params.opportunityTitle);
  const safeOrg = escapeHtml(params.organizer);
  const safeMsg = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const greeting = params.recipientName?.trim()
    ? `Olá, ${escapeHtml(params.recipientName.trim())}!`
    : "Olá!";

  const deadlineStr = params.deadline
    ? new Date(params.deadline).toLocaleDateString("pt-BR")
    : "Inscrições abertas";

  const descSnippet = params.description
    ? escapeHtml(params.description.slice(0, 320)) + (params.description.length > 320 ? "…" : "")
    : "";

  const fundingStr = params.funding
    ? escapeHtml(params.funding) + (params.fee ? ` • ${escapeHtml(params.fee)}` : "")
    : "";

  const fieldTags = (params.fields ?? [])
    .slice(0, 3)
    .map((f) => `<span style="display:inline-block;background:#f3f4f6;color:#374151;padding:2px 10px;border-radius:999px;font-size:12px;margin:2px 4px 2px 0">${escapeHtml(f)}</span>`)
    .join("");

  const ctaHref = params.applicationLink || publicAppUrl("/opportunities");
  const ctaLabel = params.applicationLink ? "Candidatar-se" : "Ver Oportunidades";

  const html = `<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;color:#111">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08)">

      <!-- Header -->
      <tr><td style="background:#2563eb;padding:20px 28px">
        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">NATTA</span>
        <span style="color:#93c5fd;font-size:13px;margin-left:10px">Nova Oportunidade</span>
      </td></tr>

      <!-- Greeting + message -->
      <tr><td style="padding:24px 28px 0">
        <p style="margin:0 0 12px;font-size:15px">${greeting}</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151">${safeMsg}</p>
      </td></tr>

      <!-- Card -->
      <tr><td style="padding:0 28px 24px">
        <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">

          <!-- Card header -->
          <div style="padding:18px 20px 12px;border-bottom:1px solid #f3f4f6">
            <div style="font-size:17px;font-weight:700;color:#111;margin-bottom:4px">${safeTitle}</div>
            <div style="font-size:13px;color:#6b7280">${safeOrg}</div>
            ${params.opportunityType ? `<span style="display:inline-block;margin-top:8px;background:#dbeafe;color:#1d4ed8;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600">${escapeHtml(params.opportunityType)}</span>` : ""}
          </div>

          <!-- Description -->
          ${descSnippet ? `<div style="padding:14px 20px 0;font-size:13px;color:#4b5563;line-height:1.6">${descSnippet}</div>` : ""}

          <!-- Details grid -->
          <div style="padding:14px 20px;display:flex;flex-wrap:wrap;gap:10px">
            <div style="font-size:13px;color:#374151">📅 <strong>Prazo:</strong> ${deadlineStr}</div>
            ${params.mode ? `<div style="font-size:13px;color:#374151">📍 <strong>Modalidade:</strong> ${escapeHtml(params.mode)}</div>` : ""}
            ${fundingStr ? `<div style="font-size:13px;color:#374151">💰 <strong>Financiamento:</strong> ${fundingStr}</div>` : ""}
          </div>

          <!-- Field tags -->
          ${fieldTags ? `<div style="padding:0 20px 16px">${fieldTags}</div>` : ""}

          <!-- CTA -->
          <div style="padding:0 20px 20px">
            <a href="${ctaHref}" target="_blank"
               style="display:inline-block;background:#2563eb;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              ${ctaLabel} →
            </a>
          </div>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:0 28px 24px">
        <p style="margin:0;color:#9ca3af;font-size:12px">Você recebeu este email porque um administrador compartilhou uma oportunidade com a sua conta NATTA.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  const plainName = params.recipientName?.trim() || "você";
  const text = `Olá, ${plainName}!\n\n${params.message}\n\n${params.opportunityTitle}\n${params.organizer}\nPrazo: ${deadlineStr}\n${params.mode ? `Modalidade: ${params.mode}\n` : ""}${fundingStr ? `Financiamento: ${fundingStr}\n` : ""}\n${ctaHref}`;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: [params.to],
        subject,
        html,
        text,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as { message?: string; name?: string };
    if (!res.ok) {
      const msg =
        typeof body?.message === "string"
          ? body.message
          : typeof body?.name === "string"
            ? body.name
            : `HTTP ${res.status}`;
      console.error("[Email] Resend error:", res.status, body);
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Email] Request failed:", msg);
    return { ok: false, error: msg };
  }
}
