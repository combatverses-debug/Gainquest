$content = Get-Content "app\page.tsx" -Raw

# Add badge to login card
$old1 = '<a href="/api/auth/strava" style={{ ...s.stravaBtn, display: "block", textDecoration: "none", textAlign: "center" }}>
          Connect with Strava
        </a>
      </div>
    </div>
  )'

$new1 = '<a href="/api/auth/strava" style={{ ...s.stravaBtn, display: "block", textDecoration: "none", textAlign: "center" }}>
          Connect with Strava
        </a>
        <img src="/powered-by-strava.png" style={{ height: 24, objectFit: "contain", marginTop: 24, opacity: 0.8 }} alt="Powered by Strava" />
      </div>
    </div>
  )'

# Add badge to home topbar
$old2 = '<img src="/icon-512.png" style={{ height: 100, objectFit: "contain", marginBottom: 10 }} alt="Gainquest" />'

$new2 = '<img src="/icon-512.png" style={{ height: 100, objectFit: "contain", marginBottom: 10 }} alt="Gainquest" />
        <img src="/powered-by-strava.png" style={{ height: 18, objectFit: "contain", opacity: 0.6, marginBottom: 8 }} alt="Powered by Strava" />'

$content = $content.Replace($old1, $new1)
$content = $content.Replace($old2, $new2)

Set-Content "app\page.tsx" -Value $content -NoNewline

Write-Host "✅ Powered by Strava badge added!" -ForegroundColor Green