# Simple PostgreSQL Database Setup for Medicus
# Run this after installing PostgreSQL

Write-Host "🔧 Setting up Medicus Database..." -ForegroundColor Cyan

# Set password (change if you used a different password during install)
$Password = "postgres"
$env:PGPASSWORD = $Password

# Test connection
Write-Host "`n1. Testing PostgreSQL connection..." -ForegroundColor Yellow
try {
    $version = psql --version
    Write-Host "   ✅ PostgreSQL found: $version" -ForegroundColor Green
} catch {
    Write-Host "   ❌ PostgreSQL not found. Make sure it's installed and in PATH" -ForegroundColor Red
    Write-Host "   Run: add-postgres-to-path.ps1 as Administrator, then restart PowerShell" -ForegroundColor Yellow
    exit 1
}

# Create database
Write-Host "`n2. Creating database 'medicus'..." -ForegroundColor Yellow
$createResult = psql -U postgres -c "CREATE DATABASE medicus;" 2>&1
if ($createResult -like "*already exists*") {
    Write-Host "   ⚠️  Database 'medicus' already exists" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Database created" -ForegroundColor Green
}

# Run schema (without pgvector for simplicity)
Write-Host "`n3. Creating tables..." -ForegroundColor Yellow
psql -U postgres -d medicus -f src/backend/src/db/schema-no-vector.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database setup complete!" -ForegroundColor Green
    
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Create a .env file in the project root" -ForegroundColor White
    Write-Host "   2. Add these variables:" -ForegroundColor White
    Write-Host ""
    Write-Host "      OPENAI_API_KEY=your_key_here" -ForegroundColor Gray
    Write-Host "      POSTGRES_HOST=localhost" -ForegroundColor Gray
    Write-Host "      POSTGRES_PORT=5432" -ForegroundColor Gray
    Write-Host "      POSTGRES_DB=medicus" -ForegroundColor Gray
    Write-Host "      POSTGRES_USER=postgres" -ForegroundColor Gray
    Write-Host "      POSTGRES_PASSWORD=$Password" -ForegroundColor Gray
    Write-Host "      PYTHON_SERVICE_URL=http://localhost:5000" -ForegroundColor Gray
    Write-Host "      NEXT_PUBLIC_BASE_URL=http://localhost:3000" -ForegroundColor Gray
    
    Write-Host "`n🔍 Verify tables were created:" -ForegroundColor Cyan
    psql -U postgres -d medicus -c "\dt"
} else {
    Write-Host "`n❌ Database setup failed" -ForegroundColor Red
}



