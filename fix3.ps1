$content = Get-Content "app\page.tsx" -Raw

$content = $content -replace 'src="/Gainquest_Logo\.png"', 'src="/icon-512.png"'
$content = $content -replace 'src="/icon-512\.png" style=\{\{ height: 80,', 'src="/icon-512.png" style={{ height: 120,'
$content = $content -replace 'src="/icon-512\.png" style=\{\{ height: 90,', 'src="/icon-512.png" style={{ height: 140,'
$content = $content -replace 'src="/icon-512\.png" style=\{\{ height: 32,', 'src="/icon-512.png" style={{ height: 44,'

Set-Content "app\page.tsx" -Value $content -NoNewline

Write-Host "✅ Logo sizes fixed!" -ForegroundColor Green

