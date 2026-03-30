Write-Host "=== Node.js Installation Verification ===" -ForegroundColor Cyan

# Check if node.exe exists in common locations
$nodePaths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:LOCALAPPDATA\nodejs\node.exe",
    "$env:ProgramFiles (x86)\nodejs\node.exe"
)

$nodeFound = $false
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeFound = $true
        Write-Host "✓ Node.js found at: $path" -ForegroundColor Green
        $version = & $path --version
        Write-Host "  Version: $($version.Trim())"
        break
    }
}

if (-not $nodeFound) {
    Write-Host "✗ Node.js not found in common locations" -ForegroundColor Red
}

# Check PATH
Write-Host "`n=== PATH Environment Variable ===" -ForegroundColor Cyan
$pathEntries = $env:Path -split ';' | Where-Object { $_ -ne '' }
$nodeInPath = $false

foreach ($entry in $pathEntries) {
    if ($entry -like '*node*') {
        Write-Host "✓ Found Node.js in PATH: $entry" -ForegroundColor Green
        $nodeInPath = $true
    }
}

if (-not $nodeInPath) {
    Write-Host "✗ Node.js directory not found in PATH" -ForegroundColor Red
}

# Test Node.js execution
Write-Host "`n=== Node.js Execution Test ===" -ForegroundColor Cyan
try {
    $testScript = "$env:TEMP\node-test-$(Get-Date -Format 'yyyyMMddHHmmss').js"
    'console.log("Node.js test successful!");' | Out-File -FilePath $testScript -Encoding ascii
    $output = node $testScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Node.js executed script successfully" -ForegroundColor Green
        Write-Host "  Output: $($output.Trim())"
    } else {
        Write-Host "✗ Node.js script execution failed" -ForegroundColor Red
        Write-Host "  Error: $output"
    }
    Remove-Item $testScript -ErrorAction SilentlyContinue
} catch {
    Write-Host "✗ Node.js test failed: $_" -ForegroundColor Red
}

Write-Host "`nVerification complete. Check for any errors above." -ForegroundColor Cyan
