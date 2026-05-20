$files = @("app\page.tsx", "app\layout.tsx")

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $content = $content -replace 'icon-512\.png', 'Gainquest-trans-logo.png'
  Set-Content $file -Value $content -NoNewline
  Write-Host "✅ Updated $file" -ForegroundColor Green
}

Write-Host "✅ All done!" -ForegroundColor Green