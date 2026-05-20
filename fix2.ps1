$content = Get-Content "app\api\sync\route.ts" -Raw

$old = '    if (!existing) {
      const { xp, str, endStat, pwr } = calculateXP(
        act.type,
        act.distance,
        act.moving_time,
        act.calories
      )'

$new = '    if (!existing) {
      const detailRes = await fetch(
        `https://www.strava.com/api/v3/activities/${act.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const detail = await detailRes.json()

      const { xp, str, endStat, pwr } = calculateXP(
        act.type,
        act.distance,
        act.moving_time,
        detail.calories
      )'

$old2 = '        calories: act.calories || 0,'
$new2 = '        calories: detail.calories || 0,'

$content = $content.Replace($old, $new)
$content = $content.Replace($old2, $new2)
Set-Content "app\api\sync\route.ts" -Value $content -NoNewline

Write-Host "✅ Fixed!" -ForegroundColor Green