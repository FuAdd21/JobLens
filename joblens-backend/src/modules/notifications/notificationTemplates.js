export const newMatchEmail = (matches) => {
  const rows = matches
    .map(
      (m) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          <strong>${m.title}</strong><br/>
          <span style="color:#666;font-size:13px;">${m.organization_name || 'Unknown organization'} · ${m.location || 'Location not specified'}</span><br/>
          <span style="color:#888;font-size:12px;">Match score: ${(m.final_score * 100).toFixed(0)}%</span>
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
          <a href="${m.source_url}" style="background:#2563eb;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:13px;">Apply</a>
        </td>
      </tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#111;">New job matches for you</h2>
      <p style="color:#555;">JobLens found ${matches.length} new opportunit${matches.length === 1 ? 'y' : 'ies'} matching your profile.</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <p style="color:#999;font-size:12px;margin-top:20px;">You're receiving this because notifications are enabled in your JobLens profile.</p>
    </div>
  `;
};