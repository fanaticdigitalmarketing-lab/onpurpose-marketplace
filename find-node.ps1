# Common Node.js installation paths
$paths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:USERPROFILE\AppData\Local\Programs\nodejs\node.exe",
    "$env:ProgramData\chocolatey\bin\node.exe"
)

Write-Host "Searching for Node.js installation..." -ForegroundColor Cyan

$found = $false
foreach ($path in $paths) {
    if (Test-Path $path) {
        $version = & $path --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $found = $true
            Write-Host "✓ Found Node.js at: $path" -ForegroundColor Green
            Write-Host "  Version: $($version.Trim())"
            break
        }
    }
}

if (-not $found) {
    Write-Host "✗ Node.js not found in common locations" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
}
