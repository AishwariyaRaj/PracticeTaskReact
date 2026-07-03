function shell({ heading, body, extraContent = '', accent = '#2563eb' }) {
  return `
    <div style="margin:0;padding:40px 20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1e293b;min-height:100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -2px rgba(0,0,0,0.05);overflow:hidden;border-collapse:collapse;">
        <!-- Top Accent Strip -->
        <tr>
          <td height="6" style="background-color:${accent};line-height:6px;font-size:6px;">&nbsp;</td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td align="center" style="padding:32px 32px 24px;">
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="font-size:20px;font-weight:800;letter-spacing:-0.025em;color:#0f172a;">
                  <span style="color:#2563eb;">Net</span>Pulse
                </td>
                <td style="padding-left:8px;">
                  <div style="width:6px;height:6px;background-color:#22c55e;border-radius:50%;display:inline-block;vertical-align:middle;"></div>
                </td>
                <td style="padding-left:6px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;font-weight:600;vertical-align:middle;">
                  Network Operations
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding:0 36px 36px;text-align:left;">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.25;">
              ${heading}
            </h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
              ${body}
            </p>
            ${extraContent}
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;margin:24px auto 0;border-collapse:collapse;text-align:center;">
        <tr>
          <td style="font-size:12px;line-height:1.6;color:#94a3b8;">
            <p style="margin:0;">This is an automated operational notification sent from NetPulse NOC.</p>
            <p style="margin:4px 0 0;">&copy; ${new Date().getFullYear()} NetPulse. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `
}

export function welcomeEmailTemplate(userName) {
  const extraContent = `
    <div style="margin-top:24px;padding-top:24px;border-top:1px solid #f1f5f9;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:12px;">Quick Start Guide</div>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td valign="top" style="width:24px;padding:8px 0;font-size:16px;line-height:1;color:#22c55e;font-weight:bold;">✓</td>
          <td style="padding:8px 0;font-size:14px;color:#475569;line-height:1.45;">
            <strong>Switch Management:</strong> Register new switch models, track physical IDs, and update live device configurations.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width:24px;padding:8px 0;font-size:16px;line-height:1;color:#22c55e;font-weight:bold;">✓</td>
          <td style="padding:8px 0;font-size:14px;color:#475569;line-height:1.45;">
            <strong>Real-time Telemetry:</strong> Keep an eye on network health with live metrics, min/median/max averages, and interactive charts.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width:24px;padding:8px 0;font-size:16px;line-height:1;color:#22c55e;font-weight:bold;">✓</td>
          <td style="padding:8px 0;font-size:14px;color:#475569;line-height:1.45;">
            <strong>Automated Alerting:</strong> Receive critical system warnings and incident details via secure mail dispatch.
          </td>
        </tr>
      </table>
    </div>
  `

  return shell({
    heading: `Welcome onboard, ${userName}`,
    body: 'Your operator account is ready. You can now access switch management, telemetry charts, and operational controls from one unified platform.',
    extraContent,
    accent: '#2563eb',
  })
}

export function passwordResetEmailTemplate(resetUrl) {
  const extraContent = `
    <div style="margin-top:20px;text-align:center;margin-bottom:28px;">
      <a href="${resetUrl}" target="_blank" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 4px 6px -1px rgba(37,99,235,0.2),0 2px 4px -2px rgba(37,99,235,0.2);">
        Reset Password
      </a>
    </div>
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b;line-height:1.5;text-align:left;">
      If the button above does not work, copy and paste this URL into your web browser:<br>
      <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;text-decoration:underline;">${resetUrl}</a>
    </div>
  `

  return shell({
    heading: 'Reset your password',
    body: 'A password reset was requested for your account. Use the secure link below to choose a new password. If you did not make this request, you can safely ignore this email.',
    extraContent,
    accent: '#f97316',
  })
}

export function clusterAlertEmailTemplate({ severity, message, timestamp }) {
  // Select color scheme based on severity
  let accent = '#3b82f6'
  let badgeBg = '#eff6ff'
  if (severity.toLowerCase() === 'high' || severity.toLowerCase() === 'critical') {
    accent = '#ef4444'
    badgeBg = '#fef2f2'
  } else if (severity.toLowerCase() === 'medium' || severity.toLowerCase() === 'warning') {
    accent = '#f97316'
    badgeBg = '#fff7ed'
  }

  const extraContent = `
    <div style="margin-top:20px;padding:20px;border-radius:12px;background-color:#f8fafc;border:1px solid #e2e8f0;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#475569;">
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;width:120px;">Incident</td>
          <td style="padding:6px 0;">Cluster Warning Notification</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;">Severity Level</td>
          <td style="padding:6px 0;">
            <span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;text-transform:uppercase;background-color:${badgeBg};color:${accent};">
              ${severity}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;">Timestamp</td>
          <td style="padding:6px 0;">${timestamp}</td>
        </tr>
        <tr>
          <td valign="top" style="padding:6px 0;font-weight:600;color:#0f172a;">Description</td>
          <td style="padding:6px 0;line-height:1.5;">${message}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top:20px;padding:12px 16px;border-radius:8px;background-color:#fff5f5;border:1px solid #fee2e2;font-size:13px;color:#991b1b;line-height:1.5;font-weight:500;">
      ⚠️ NOC Action Required: Please review active switches and telemetry load averages in your dashboard immediately.
    </div>
  `

  return shell({
    heading: 'Cluster Incident Warning',
    body: 'A cluster telemetry threshold or failure state has triggered the following critical alert notification.',
    extraContent,
    accent,
  })
}
