$ErrorActionPreference = "Stop"
$toolsDir = "C:\Users\Ocean Developers LTD\tools"
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir -Force }
$zipPath = "$toolsDir\node.zip"
$destPath = "$toolsDir\nodejs"
$tempPath = "$toolsDir\temp"

Write-Host "Downloading Node.js..."
curl.exe -sL -o $zipPath https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip

Write-Host "Extracting..."
if (Test-Path $tempPath) { Remove-Item $tempPath -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempPath -Force

if (Test-Path $destPath) { Remove-Item $destPath -Recurse -Force }
Move-Item -Path "$tempPath\node-v20.18.0-win-x64" -Destination $destPath -Force

Remove-Item $zipPath -Force
Remove-Item $tempPath -Recurse -Force

Write-Host "Verifying Node and NPM..."
& "$destPath\node.exe" --version
& "$destPath\npm.cmd" --version
Write-Host "Node.js installed successfully!"
