# Run as Administrator
# This adds PostgreSQL to your system PATH

$postgresPath = "C:\Program Files\PostgreSQL\14\bin"

# Check if path exists
if (Test-Path $postgresPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    if ($currentPath -notlike "*$postgresPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$postgresPath", [System.EnvironmentVariableTarget]::Machine)
        Write-Host "✅ PostgreSQL added to PATH. Please restart PowerShell." -ForegroundColor Green
    } else {
        Write-Host "✅ PostgreSQL already in PATH" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  PostgreSQL not found at $postgresPath" -ForegroundColor Yellow
    Write-Host "Please adjust the path in this script to match your installation" -ForegroundColor Yellow
}



