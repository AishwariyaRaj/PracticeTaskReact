function shell({ heading, body, extraContent = '', accent = '#3b82f6' }) {
  return `
    <div style="margin:0;padding:40px 20px;background-color:#060913;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#f8fafc;min-height:100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;margin:0 auto;background-color:#0e1524;border-radius:16px;border:1px solid #1f293d;box-shadow:0 12px 30px rgba(0,0,0,0.5);overflow:hidden;border-collapse:collapse;">
        <!-- Top Accent Strip -->
        <tr>
          <td height="4" style="background:linear-gradient(90deg, ${accent} 0%, #6366f1 100%);line-height:4px;font-size:4px;">&nbsp;</td>
        </tr>
        
        <!-- Header -->
        <tr>
          <td align="center" style="padding:36px 32px 24px;">
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;">
                  <span style="color:#3b82f6;">Net</span>Pulse
                </td>
                <td style="padding-left:10px;">
                  <div style="width:6px;height:6px;background-color:#10b981;border-radius:50%;display:inline-block;vertical-align:middle;box-shadow:0 0 8px #10b981;"></div>
                </td>
                <td style="padding-left:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;font-weight:700;vertical-align:middle;">
                  NOC SYSTEMS
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding:0 40px 40px;text-align:left;">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;letter-spacing:-0.025em;color:#ffffff;line-height:1.3;">
              ${heading}
            </h1>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#94a3b8;">
              ${body}
            </p>
            ${extraContent}
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;margin:28px auto 0;border-collapse:collapse;text-align:center;">
        <tr>
          <td style="font-size:11px;line-height:1.6;color:#64748b;letter-spacing:0.02em;">
            <p style="margin:0;">This is an automated operational notification sent from NetPulse NOC console.</p>
            <p style="margin:4px 0 0;">&copy; ${new Date().getFullYear()} NetPulse. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `
}

export function welcomeEmailTemplate(userName) {
  const extraContent = `
    <div style="margin-top:28px;padding-top:24px;border-top:1px solid #1f293d;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:16px;">Quick Start Guide</div>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td valign="top" style="padding-bottom:16px;">
            <div style="background-color:#161d2d;border:1px solid #232f48;border-radius:10px;padding:16px;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top" style="font-size:16px;line-height:1.2;color:#10b981;font-weight:bold;padding-right:12px;">✓</td>
                  <td style="font-size:14px;color:#94a3b8;line-height:1.5;">
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Switch Management</strong>
                    Register switch hardware, configure profiles, track physical positions, and perform state toggles.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td valign="top" style="padding-bottom:16px;">
            <div style="background-color:#161d2d;border:1px solid #232f48;border-radius:10px;padding:16px;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top" style="font-size:16px;line-height:1.2;color:#10b981;font-weight:bold;padding-right:12px;">✓</td>
                  <td style="font-size:14px;color:#94a3b8;line-height:1.5;">
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Telemetry Charts</strong>
                    Monitor network loading with interactive charting tools displaying min, median, and max averages.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td valign="top;">
            <div style="background-color:#161d2d;border:1px solid #232f48;border-radius:10px;padding:16px;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top" style="font-size:16px;line-height:1.2;color:#10b981;font-weight:bold;padding-right:12px;">✓</td>
                  <td style="font-size:14px;color:#94a3b8;line-height:1.5;">
                    <strong style="color:#ffffff;display:block;margin-bottom:2px;">Automated Alerting</strong>
                    Configure instant warnings to receive push and email dispatches during telemetry escalations.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `

  return shell({
    heading: `Welcome onboard, ${userName}`,
    body: 'Your operator account is ready. You can now access switch management, telemetry charts, and operational controls from one unified platform.',
    extraContent,
    accent: '#3b82f6',
  })
}

export function passwordResetEmailTemplate(resetUrl) {
  const extraContent = `
    <div style="margin-top:24px;text-align:center;margin-bottom:28px;">
      <a href="${resetUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);color:#ffffff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(59,130,246,0.3);">
        Reset Password
      </a>
    </div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #1f293d;font-size:13px;color:#64748b;line-height:1.5;text-align:left;">
      If the button above does not work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color:#3b82f6;word-break:break-all;text-decoration:underline;">${resetUrl}</a>
    </div>
  `

  return shell({
    heading: 'Reset your password',
    body: 'A password reset request was received for your operator account. Click the secure link below to set a new password. If you did not make this request, you can safely ignore this warning.',
    extraContent,
    accent: '#f97316',
  })
}

export function clusterAlertEmailTemplate({ severity, message, timestamp }) {
  let accent = '#3b82f6'
  let badgeBg = '#1e3a8a'
  let badgeTextColor = '#93c5fd'
  let panelBg = '#161d2d'
  let panelBorder = '#232f48'

  if (severity.toLowerCase() === 'high' || severity.toLowerCase() === 'critical') {
    accent = '#ef4444'
    badgeBg = '#450a0a'
    badgeTextColor = '#fca5a5'
    panelBg = '#1c1315'
    panelBorder = '#3b1c1e'
  } else if (severity.toLowerCase() === 'medium' || severity.toLowerCase() === 'warning') {
    accent = '#f97316'
    badgeBg = '#431407'
    badgeTextColor = '#ffedd5'
    panelBg = '#1c1511'
    panelBorder = '#3b201a'
  }

  const extraContent = `
    <div style="margin-top:24px;padding:24px;border-radius:12px;background-color:${panelBg};border:1px solid ${panelBorder};">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#94a3b8;">
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#ffffff;width:130px;">Incident Type</td>
          <td style="padding:8px 0;color:#ffffff;">Cluster Warning Notification</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#ffffff;">Severity Level</td>
          <td style="padding:8px 0;">
            <span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;text-transform:uppercase;background-color:${badgeBg};color:${badgeTextColor};letter-spacing:0.04em;">
              ${severity}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600;color:#ffffff;">Timestamp</td>
          <td style="padding:8px 0;font-family:monospace;color:#ffffff;">${timestamp}</td>
        </tr>
        <tr>
          <td valign="top" style="padding:8px 0;font-weight:600;color:#ffffff;">Description</td>
          <td style="padding:8px 0;line-height:1.5;color:#e2e8f0;">${message}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top:24px;padding:16px 20px;border-radius:8px;background-color:#2a1215;border:1px solid #ef4444;font-size:13px;color:#fca5a5;line-height:1.55;font-weight:600;">
      ⚡ NOC ACTION REQUIRED: Please review active switches and telemetry load averages in your dashboard immediately.
    </div>
  `

  return shell({
    heading: 'Cluster Incident Warning',
    body: 'A cluster telemetry threshold or failure state has triggered the following critical alert notification.',
    extraContent,
    accent,
  })
}
