import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP email for contact form notifications. Configured entirely through environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally MAIL_FROM_NAME and INQUIRY_NOTIFY_TO.
 * When SMTP is not configured, sending is skipped and inquiries are still saved in the admin panel.
 */

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface InquiryMail {
  name: string;
  email: string;
  phone: string;
  interest: string;
  reference: string;
  condoName: string;
  message: string;
  adminUrl: string;
}

function row(label: string, value: string) {
  return value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#5d6475;font:13px Arial,sans-serif;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#2c3242;font:14px Arial,sans-serif">${esc(value)}</td></tr>`
    : "";
}

/** Sends the new-inquiry notification to the agent and a short confirmation to the visitor. Never throws. */
export async function sendInquiryEmails(i: InquiryMail, opts: { agentName: string; notifyTo: string }): Promise<void> {
  if (!isMailConfigured()) return;
  const fromName = process.env.MAIL_FROM_NAME || opts.agentName || "Website";
  const from = `"${fromName.replace(/"/g, "")}" <${process.env.SMTP_USER}>`;
  const to = process.env.INQUIRY_NOTIFY_TO || opts.notifyTo || process.env.SMTP_USER!;
  const mail = getTransporter();

  const subject = `New website inquiry: ${i.interest}${i.condoName ? ` (${i.condoName})` : ""} from ${i.name}`;
  const notification = mail.sendMail({
    from,
    to,
    replyTo: `"${i.name.replace(/"/g, "")}" <${i.email}>`,
    subject,
    text: [
      `New inquiry from the website`,
      ``,
      `Name: ${i.name}`,
      `Email: ${i.email}`,
      i.phone && `Phone: ${i.phone}`,
      `Interested in: ${i.interest}`,
      i.condoName && `Condo building: ${i.condoName}`,
      i.reference && `Property reference: ${i.reference}`,
      ``,
      i.message,
      ``,
      `Reply to this email to respond directly. View all inquiries: ${i.adminUrl}`,
    ]
      .filter((l): l is string => typeof l === "string")
      .join("\n"),
    html: `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif">
  <h2 style="font:normal 22px Georgia,serif;color:#29345f;margin:0 0 16px">New website inquiry</h2>
  <table style="border-collapse:collapse;margin-bottom:16px">
    ${row("Name", i.name)}${row("Email", i.email)}${row("Phone", i.phone)}${row("Interested in", i.interest)}${row("Condo building", i.condoName)}${row("Property reference", i.reference)}
  </table>
  <div style="background:#f0f2f6;padding:16px;color:#2c3242;font:14px/1.6 Arial,sans-serif;white-space:pre-wrap">${esc(i.message)}</div>
  <p style="color:#5d6475;font:13px Arial,sans-serif;margin-top:16px">Reply to this email to respond directly to ${esc(i.name)}. <a href="${esc(i.adminUrl)}" style="color:#29345f">View in admin</a></p>
</div>`,
  });

  const confirmation = mail.sendMail({
    from,
    to: i.email,
    replyTo: to,
    subject: `Thank you for your message, ${i.name}`,
    text: `Hello ${i.name},\n\nThank you for contacting ${fromName}. Your message has been received and we will get back to you soon.\n\nYour message:\n${i.message}\n\nKind regards,\n${fromName}`,
    html: `<div style="max-width:560px;margin:0 auto;font:15px/1.6 Arial,sans-serif;color:#2c3242">
  <p>Hello ${esc(i.name)},</p>
  <p>Thank you for contacting ${esc(fromName)}. Your message has been received and we will get back to you soon.</p>
  <div style="background:#f0f2f6;padding:14px;margin:16px 0;white-space:pre-wrap;font-size:14px">${esc(i.message)}</div>
  <p>Kind regards,<br>${esc(fromName)}</p>
</div>`,
  });

  const results = await Promise.allSettled([notification, confirmation]);
  results.forEach((r, idx) => {
    if (r.status === "rejected") console.error(`[mail] ${idx === 0 ? "notification" : "confirmation"} failed`, r.reason);
  });
}
