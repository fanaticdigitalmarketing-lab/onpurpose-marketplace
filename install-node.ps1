# One-time Node.js LTS installer for Windsurf

Write-Host "Installing latest Node.js LTS version..."

# Detect system architecture
if ([Environment]::Is64BitOperatingSystem) {
    $arch = "x64"
} else {
    $arch = "x86"
}

# Get the latest LTS version dynamically from Node.js API
$nodeInfo = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json"
$latestLTS = ($nodeInfo | Where-Object { $_.lts -ne $null })[0].version
$installerUrl = "https://nodejs.org/dist/$latestLTS/node-$latestLTS-$arch.msi"

# Download the installer
$installerPath = "$env:TEMP\node-lts.msi"
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

# Install silently
Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait

# Remove installer
Remove-Item $installerPath

# Verify installation
Write-Host "Node.js version:" (node -v)
Write-Host "NPM version:" (npm -v)

Write-Host "Node.js LTS installation completed."
