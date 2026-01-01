# PowerShell script to apply user block fields migration
# This script applies the SQL migration directly to the database

Write-Host "Applying user block fields migration..." -ForegroundColor Cyan

# Read DATABASE_URL from .env
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

$databaseUrl = ""
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^DATABASE_URL\s*=\s*(.+)$') {
        $databaseUrl = $matches[1].Trim('"').Trim("'")
    }
}

if (-not $databaseUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env file!" -ForegroundColor Red
    exit 1
}

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "ERROR: Invalid DATABASE_URL format!" -ForegroundColor Red
    exit 1
}

Write-Host "Database connection:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# SQL file path
$sqlFile = "prisma\migrations\20250115000003_add_user_block_fields\migration.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL migration file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "`nRunning SQL migration..." -ForegroundColor Cyan

# Run psql command
$psqlCommand = "psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile"

try {
    Invoke-Expression $psqlCommand
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS: User block fields migration applied!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "  1. Run: npx prisma generate" -ForegroundColor Gray
        Write-Host "  2. Restart your dev server" -ForegroundColor Gray
    } else {
        Write-Host "`nERROR: SQL migration failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`nERROR: Failed to run psql command!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear PGPASSWORD
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

