# PowerShell script to apply tax & invoice management migration
# Usage: .\scripts\apply-tax-invoice-migration.ps1

Write-Host "Applying Tax & Invoice Management Migration..." -ForegroundColor Cyan

# Read DATABASE_URL from .env
$envPath = Join-Path (Join-Path $PSScriptRoot "..") ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw
$databaseUrlMatch = $envContent -match 'DATABASE_URL=["'']?([^"'']+)["'']?'
if (-not $databaseUrlMatch) {
    Write-Host "Error: DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

$databaseUrl = $matches[1]

# Extract connection details from DATABASE_URL
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "Error: Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}

# Path to migration file
$migrationFile = Join-Path (Join-Path (Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "prisma") "migrations") "20250115000010_tax_invoice_management") "migration.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading migration file..." -ForegroundColor Yellow
$sqlContent = Get-Content $migrationFile -Raw

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

Write-Host "Executing migration SQL..." -ForegroundColor Yellow
try {
    $sqlContent | & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error: Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error executing migration: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD
}

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "..")
& npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Prisma generate failed" -ForegroundColor Yellow
}

Write-Host "Migration completed!" -ForegroundColor Green

