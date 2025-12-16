$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

function Assert-LastExitCode($label) {
  if ($LASTEXITCODE -ne 0) {
    throw "$label failed with exit code $LASTEXITCODE"
  }
}

Write-Host "== Static audit =="
powershell -ExecutionPolicy Bypass -File scripts\static-audit.ps1
Assert-LastExitCode "Static audit"

Write-Host "`n== Playwright smoke =="
node .\node_modules\@playwright\test\cli.js test --reporter=list
Assert-LastExitCode "Playwright smoke"

Write-Host "`nWorkstream 5 checks passed."
