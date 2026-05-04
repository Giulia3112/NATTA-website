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

  const opportunityUrl = publicAppUrl(`/opportunities/${params.opportunityId}`);
  const subject = `NATTA — ${params.opportunityTitle}`.slice(0, 998);

  const safeTitle = escapeHtml(params.opportunityTitle);
  const safeOrg = escapeHtml(params.organizer);
  const safeMsg = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const greeting = params.recipientName?.trim()
    ? `Hi ${escapeHtml(params.recipientName.trim())},`
    : "Hi,";

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;line-height:1.5;color:#111">
  <p>${greeting}</p>
  <p>${safeMsg}</p>
  <p><strong>${safeTitle}</strong><br/><span style="color:#666">${safeOrg}</span></p>
  <p><a href="${opportunityUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">View on NATTA</a></p>
  <p style="color:#888;font-size:13px;margin-top:32px">You received this because an administrator shared an opportunity with your NATTA account.</p>
</body></html>`;

  const plainName = params.recipientName?.trim() || "there";
  const text = `${plainName},\n\n${params.message}\n\n${params.opportunityTitle} — ${params.organizer}\n\n${opportunityUrl}`;

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
