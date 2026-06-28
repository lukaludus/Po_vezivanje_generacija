# Deploy skripta za (Po)vezivanje generacija
# 1) Sinhronizuje deployable fajlove iz izvora (root) u dist/
# 2) Deploy-uje dist/ na Cloudflare Pages (projekat: povezivanjegeneracija)
#
# Upotreba:  .\deploy.ps1
#
# Napomena: dist/ je build izlaz (u .gitignore) i NE servira se sa GitHub-a.
# Zato svaka izmena sadržaja mora proći kroz ovu skriptu da bi bila uživo.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dist = Join-Path $root "dist"

# Lista fajlova/foldera koji čine sajt (sve ostalo u root-u je interno).
$manifest = @(
  "apple-touch-icon.png",
  "assets",
  "css",
  "favicon-16.png",
  "favicon-32.png",
  "favicon-48.png",
  "favicon.ico",
  "favicon.svg",
  "googleaad17f0db86d2e13.html",
  "index.html",
  "js",
  "letak.html",
  "robots.txt",
  "sitemap.xml"
)

Write-Host "Sinhronizujem izvor -> dist/ ..." -ForegroundColor Cyan
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

foreach ($item in $manifest) {
  $src = Join-Path $root $item
  $dst = Join-Path $dist $item
  if (-not (Test-Path $src)) {
    Write-Host "  ! preskačem (ne postoji): $item" -ForegroundColor Yellow
    continue
  }
  if (Test-Path $src -PathType Container) {
    if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
    Copy-Item $src $dst -Recurse -Force
  } else {
    Copy-Item $src $dst -Force
  }
  Write-Host "  + $item"
}

Write-Host "Deploy na Cloudflare Pages ..." -ForegroundColor Cyan
npx wrangler pages deploy "$dist" --project-name=povezivanjegeneracija
