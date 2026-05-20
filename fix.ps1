$content = Get-Content "app\page.tsx" -Raw

$oldBlock = @'
      href={`https://www.strava.com/activities/${act.strava_id}`}
  target="_blank"
  rel="noopener noreferrer"
  style={s.stravaLink}
>{"View on Strava ↗"}</a>
'@

$newBlock = @'
          <a href={"https://www.strava.com/activities/" + act.strava_id} target="_blank" rel="noopener noreferrer" style={s.stravaLink}>{"View on Strava"}</a>
'@

$content = $content.Replace($oldBlock, $newBlock)
Set-Content "app\page.tsx" -Value $content -NoNewline

Write-Host "✅ Fixed!" -ForegroundColor Green