# GainQuest - Premium UI Upgrade
# Fixes: Realms card grid, background texture, hero card glow, XP bar shimmer
# Run from project root in VS Code terminal

Write-Host "Applying premium UI upgrades..." -ForegroundColor Yellow

# -----------------------------------------------
# 1. FIX REALMS CARD - move into quick access grid
# -----------------------------------------------

$mainPage = "app/page.tsx"
if (Test-Path $mainPage) {
    $content = Get-Content $mainPage -Raw

    # Fix the quick access grid - replace the broken layout with a proper 2x2 grid
    $oldQuickAccess = @'
            <div style={{ display: "flex", gap: 8, padding: "0 16px 14px" }}>
              <div style={s.quickCard} onClick={() => window.location.href = "/character"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🧙</div>
                <div style={s.quickTitle}>Character</div>
                <div style={s.quickSub}>& Medals</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/readiness"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>⚔</div>
                <div style={s.quickTitle}>Battle</div>
                <div style={s.quickSub}>Readiness</div>
              </div>
              
              <div style={s.quickCard} onClick={() => window.location.href = "/calendar"}>
              <div style={s.quickTitle}>Calendar</div>
               <div style={s.quickSub}>Training history</div>
              </div>
            </div>
            <div style={s.quickCard} onClick={() => window.location.href = "/realms"}>
  <div style={s.quickTitle}>Realms</div>
  <div style={s.quickSub}>& Map</div>
</div>
'@

    $newQuickAccess = @'
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px 14px" }}>
              <div style={s.quickCard} onClick={() => window.location.href = "/character"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🧙</div>
                <div style={s.quickTitle}>Character</div>
                <div style={s.quickSub}>& Medals</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/readiness"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>⚔</div>
                <div style={s.quickTitle}>Battle</div>
                <div style={s.quickSub}>Readiness</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/calendar"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
                <div style={s.quickTitle}>Calendar</div>
                <div style={s.quickSub}>Training history</div>
              </div>
              <div style={s.quickCard} onClick={() => window.location.href = "/realms"}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🗺️</div>
                <div style={s.quickTitle}>Realms</div>
                <div style={s.quickSub}>& Map</div>
              </div>
            </div>
'@

    $content = $content.Replace($oldQuickAccess, $newQuickAccess)

    # Update app background to include subtle star texture via radial gradients
    $oldAppStyle = 'app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#0a0810" },'
    $newAppStyle = 'app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#0a0810", backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(123,92,240,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(245,196,117,0.04) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(155,127,232,0.03) 0%, transparent 70%)" },'
    $content = $content.Replace($oldAppStyle, $newAppStyle)

    # Update center background to match
    $oldCenterStyle = 'center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0810" },'
    $newCenterStyle = 'center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0810", backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(123,92,240,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(245,196,117,0.04) 0%, transparent 50%)" },'
    $content = $content.Replace($oldCenterStyle, $newCenterStyle)

    # Add purple glow to hero card
    $oldHeroCard = 'heroCard: { margin: "14px 16px", background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 12, padding: 14, position: "relative" as const },'
    $newHeroCard = 'heroCard: { margin: "14px 16px", background: "#0e0b1a", border: "1px solid #2a1f45", borderRadius: 12, padding: 14, position: "relative" as const, boxShadow: "0 0 24px rgba(123,92,240,0.12), 0 0 48px rgba(123,92,240,0.06), inset 0 1px 0 rgba(155,127,232,0.1)" },'
    $content = $content.Replace($oldHeroCard, $newHeroCard)

    # Add shimmer animation to XP bar fill
    $oldXpFill = 'xpBarFill: { height: "100%", borderRadius: 20, background: "linear-gradient(90deg, #534AB7, #9B7FE8)", transition: "width 0.6s ease" },'
    $newXpFill = 'xpBarFill: { height: "100%", borderRadius: 20, background: "linear-gradient(90deg, #534AB7, #9B7FE8, #534AB7)", backgroundSize: "200% 100%", transition: "width 0.6s ease", animation: "shimmer 2.5s infinite linear" },'
    $content = $content.Replace($oldXpFill, $newXpFill)

    Set-Content $mainPage $content -NoNewline
    Write-Host "Fixed: app/page.tsx" -ForegroundColor Green
} else {
    Write-Host "Could not find app/page.tsx" -ForegroundColor Red
}

# -----------------------------------------------
# 2. ADD SHIMMER KEYFRAME + STAR TEXTURE TO GLOBALS
# -----------------------------------------------

# Find globals css - check common locations
$globalFiles = @("app/globals.css", "styles/globals.css", "src/app/globals.css")
$globalFile = $null
foreach ($f in $globalFiles) {
    if (Test-Path $f) { $globalFile = $f; break }
}

if ($globalFile) {
    $css = Get-Content $globalFile -Raw

    $shimmerCss = @'

/* GainQuest Premium - Shimmer animation */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Subtle star particles */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background-image: 
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 35%, rgba(245,196,117,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 10%, rgba(255,255,255,0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 25%, rgba(155,127,232,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 75% 8%, rgba(255,255,255,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 40%, rgba(245,196,117,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 15% 75%, rgba(155,127,232,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 85%, rgba(255,255,255,0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 90%, rgba(245,196,117,0.1) 0%, transparent 100%);
}

/* Hero card glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 24px rgba(123,92,240,0.12), 0 0 48px rgba(123,92,240,0.06); }
  50% { box-shadow: 0 0 32px rgba(123,92,240,0.2), 0 0 64px rgba(123,92,240,0.1); }
}
'@

    # Only add if not already there
    if ($css -notmatch "shimmer") {
        $css = $css + $shimmerCss
        Set-Content $globalFile $css -NoNewline
        Write-Host "Updated: $globalFile" -ForegroundColor Green
    } else {
        Write-Host "Shimmer already exists in globals - skipped" -ForegroundColor Gray
    }
} else {
    Write-Host "globals.css not found - creating app/globals.css additions" -ForegroundColor Yellow
    
    # Create a separate css file to import
    $shimmerOnly = @'
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 24px rgba(123,92,240,0.12), 0 0 48px rgba(123,92,240,0.06); }
  50% { box-shadow: 0 0 32px rgba(123,92,240,0.2), 0 0 64px rgba(123,92,240,0.1); }
}

body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  background-image: 
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 35%, rgba(245,196,117,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 25%, rgba(155,127,232,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 40%, rgba(245,196,117,0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 15% 75%, rgba(155,127,232,0.15) 0%, transparent 100%);
}
'@
    Set-Content "app/gainquest-premium.css" $shimmerOnly -NoNewline
    Write-Host "Created: app/gainquest-premium.css - add this import to your layout.tsx" -ForegroundColor Yellow
}

# -----------------------------------------------
# 3. UPDATE CHARACTER PAGE BACKGROUND TO MATCH
# -----------------------------------------------

$charPage = "app/character/page.tsx"
if (Test-Path $charPage) {
    $charContent = Get-Content $charPage -Raw

    $oldCharApp = 'app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0a0f", fontFamily: "system-ui, sans-serif", paddingBottom: 80 },'
    $newCharApp = 'app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0a0810", fontFamily: "system-ui, sans-serif", paddingBottom: 80, backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(123,92,240,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(245,196,117,0.04) 0%, transparent 50%)" },'
    $charContent = $charContent.Replace($oldCharApp, $newCharApp)

    # Add glow to charStage
    $oldCharStage = 'charStage: { background: "#12101a", borderRadius: 16, border: "1px solid #2a2040", padding: 14, marginBottom: 14, position: "relative" },'
    $newCharStage = 'charStage: { background: "#12101a", borderRadius: 16, border: "1px solid #2a2040", padding: 14, marginBottom: 14, position: "relative", boxShadow: "0 0 24px rgba(123,92,240,0.1), inset 0 1px 0 rgba(155,127,232,0.08)" },'
    $charContent = $charContent.Replace($oldCharStage, $newCharStage)

    Set-Content $charPage $charContent -NoNewline
    Write-Host "Updated: app/character/page.tsx" -ForegroundColor Green
} else {
    Write-Host "character/page.tsx not found - skipped" -ForegroundColor Gray
}

# -----------------------------------------------
# 4. GIT COMMIT & PUSH
# -----------------------------------------------

Write-Host "`nCommitting premium upgrades..." -ForegroundColor Yellow
git add .
git commit -m "premium UI upgrades - grid fix, background texture, glow, shimmer"
git push

Write-Host "`nDone! Changes applied:" -ForegroundColor Green
Write-Host "  ✓ Quick access fixed to proper 2x2 grid" -ForegroundColor Cyan
Write-Host "  ✓ Realms card moved into grid" -ForegroundColor Cyan
Write-Host "  ✓ Background subtle purple/gold radial texture" -ForegroundColor Cyan
Write-Host "  ✓ Hero card purple glow" -ForegroundColor Cyan
Write-Host "  ✓ XP bar shimmer animation" -ForegroundColor Cyan
Write-Host "  ✓ Star particles via CSS" -ForegroundColor Cyan
Write-Host "  ✓ Character page updated to match" -ForegroundColor Cyan