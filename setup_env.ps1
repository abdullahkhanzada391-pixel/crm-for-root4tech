$current = [Environment]::GetEnvironmentVariable('Path', 'User')
$nodePath = "C:\Users\Ocean Developers LTD\tools\nodejs"
$uvPath = "C:\Users\Ocean Developers LTD\.local\bin"
if ($current -notlike "*$nodePath*") {
    $current = "$nodePath;$uvPath;$current"
    [Environment]::SetEnvironmentVariable('Path', $current, 'User')
}
$env:Path = "$nodePath;$uvPath;$env:Path"
Write-Host "Node version:" (node --version)
Write-Host "NPM version:" (npm --version)
Write-Host "UV version:" (uv --version)
Write-Host "Python version:" (uv run python --version)
