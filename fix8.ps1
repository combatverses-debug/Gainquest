$content = Get-Content "app\page.tsx" -Raw

$old = '<div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>'
$new = '<div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>'

$content = $content.Replace($old, $new)

$old2 = '    <div style={s.weekStatLbl}>Run this week</div>
              </div>
            </div>'

$new2 = '    <div style={s.weekStatLbl}>Run this week</div>
              </div>
              <div style={s.weekStat}>
                <div style={{ ...s.weekStatVal, color: "#E24B4A" }}>
                  {activities.filter((a: any) => new Date(a.date) >= weekStart).reduce((s: number, a: any) => s + (a.calories || 0), 0).toLocaleString()}
                </div>
                <div style={s.weekStatLbl}>Calories burned</div>
              </div>
            </div>'

$content = $content.Replace($old2, $new2)
Set-Content "app\page.tsx" -Value $content -NoNewline

Write-Host "✅ Weekly calories added!" -ForegroundColor Green