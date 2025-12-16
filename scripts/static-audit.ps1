$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

function Assert-ZeroCount($label, $count) {
  if ($count -ne 0) {
    Write-Host "[FAIL] ${label}: ${count}"
    return $false
  }
  Write-Host "[OK]   ${label}: ${count}"
  return $true
}

$ok = $true

$moduleCssCount = (Get-ChildItem -Recurse -Filter *.module.css -ErrorAction SilentlyContinue | Measure-Object).Count
$ok = (Assert-ZeroCount "*.module.css" $moduleCssCount) -and $ok

$moduleScssCount = (Get-ChildItem -Recurse -Filter *.module.scss -ErrorAction SilentlyContinue | Measure-Object).Count
$ok = (Assert-ZeroCount "*.module.scss" $moduleScssCount) -and $ok

$scssCount = (Get-ChildItem -Recurse -Include *.scss,*.sass -ErrorAction SilentlyContinue | Measure-Object).Count
$ok = (Assert-ZeroCount "*.scss/*.sass" $scssCount) -and $ok

$sources = Get-ChildItem -Recurse -Path src -Include *.js,*.jsx,*.ts,*.tsx -ErrorAction SilentlyContinue
$tailwindHits = $sources | Select-String -Pattern 'className=\{?[''"][^\''"]*(\bflex\b|\bgrid\b|\bp-\d+\b|\bmx-\d+\b|\btext-\w+\b|\bbg-\w+\b)[^\''"]*[''"]' -List -ErrorAction SilentlyContinue
if ($tailwindHits) {
  Write-Host "[WARN] tailwind-like className patterns found (manual check recommended):"
  $tailwindHits | Select-Object -First 20 | ForEach-Object { Write-Host ("  - " + $_.Path + ":" + $_.LineNumber) }
} else {
  Write-Host "[OK]   tailwind-like className patterns: 0"
}

$tiptapHits = $sources | Select-String -Pattern "tiptap|hocuspocus|yjs" -List -ErrorAction SilentlyContinue
if ($tiptapHits) {
  Write-Host "[FAIL] tiptap/hocuspocus/yjs references found:"
  $tiptapHits | Select-Object -First 20 | ForEach-Object { Write-Host ("  - " + $_.Path + ":" + $_.LineNumber) }
  $ok = $false
} else {
  Write-Host "[OK]   tiptap/hocuspocus/yjs references: 0"
}

if (-not $ok) {
  exit 1
}

Write-Host "Static audit passed."
