function shell({ title, heading, body, accent = '#1d4ed8' }) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:linear-gradient(135deg,#0f172a 0%,#111827 45%,#1d4ed8 100%);border-radius:20px;padding:32px;color:#fff;box-shadow:0 18px 50px rgba(15,23,42,.22);">
          <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.82;">Highre Network Operations</div>
          <h1 style="margin:16px 0 8px;font-size:28px;line-height:1.2;">${heading}</h1>
          <p style="margin:0 0 20px;color:rgba(255,255,255,.88);font-size:15px;line-height:1.7;">${body}</p>
          <div style="margin-top:28px;padding:18px 20px;border-radius:16px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);">
            <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.7;">Title</div>
            <div style="margin-top:6px;font-size:16px;font-weight:700;color:${accent};">${title}</div>
          </div>
        </div>
        <div style="padding:18px 6px 0;color:#64748b;font-size:12px;line-height:1.6;">
          This message was generated automatically by the Highre dashboard.
        </div>
      </div>
    </div>
  `
}

export function welcomeEmailTemplate(userName) {
  return shell({
    title: 'Welcome onboard',
    heading: `Welcome, ${userName}`,
    body: 'Your account is ready. You can now access switch management, analytics dashboards, and operational alerts from one place.',
  })
}

export function passwordResetEmailTemplate(resetUrl) {
  return shell({
    title: 'Password reset request',
    heading: 'Reset your password',
    body: `A password reset was requested for your account. Use the secure link below to choose a new password: ${resetUrl}`,
    accent: '#f97316',
  })
}

export function clusterAlertEmailTemplate({ severity, message, timestamp }) {
  return shell({
    title: 'Cluster alert',
    heading: `Severity ${severity} event detected`,
    body: `${message} Event timestamp: ${timestamp}. Please review cluster health immediately and verify redundancy paths, interface status, and service availability.`,
    accent: '#ef4444',
  })
}
