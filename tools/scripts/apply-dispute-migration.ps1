# PowerShell script to apply enhanced dispute system migration
# This script reads DATABASE_URL from .env and applies the SQL migration

$ErrorActionPreference = "Stop"

Write-Host "Applying enhanced dispute system migration..." -ForegroundColor Cyan

# Read .env file
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# Parse DATABASE_URL from .env
$envContent = Get-Content $envPath -Raw
$databaseUrlMatch = [regex]::Match($envContent, 'DATABASE_URL\s*=\s*["'']?([^"'']+)["'']?')

if (-not $databaseUrlMatch.Success) {
    Write-Host "ERROR: DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

$databaseUrl = $databaseUrlMatch.Groups[1].Value.Trim()

# Parse connection details
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "ERROR: Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}

Write-Host "Database connection:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost"
Write-Host "  Port: $dbPort"
Write-Host "  Database: $dbName"
Write-Host "  User: $dbUser"
Write-Host ""

# Get migration SQL file path
$migrationDir = Join-Path $projectRoot "prisma"
$migrationDir = Join-Path $migrationDir "migrations"
$migrationDir = Join-Path $migrationDir "20250115000006_enhance_dispute_system"
$migrationFile = Join-Path $migrationDir "migration.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found at $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Running SQL migration..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPassword

try {
    # Run psql command
    $psqlCommand = "psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f `"$migrationFile`""
    
    $result = Invoke-Expression $psqlCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Migration failed!" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to execute migration" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npx prisma generate"
Write-Host "2. Restart your dev server"

