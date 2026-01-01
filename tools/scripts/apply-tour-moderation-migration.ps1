# PowerShell script to apply tour moderation migration
# This adds isBlocked, blockedBy, blockedAt, blockReason, blockNotes, unblockedBy, unblockedAt columns to tours table

Write-Host "Applying tour moderation migration..." -ForegroundColor Cyan

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
    Write-Host "ERROR: DATABASE_URL not found in .env!" -ForegroundColor Red
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
Write-Host "  Host: $dbHost"
Write-Host "  Port: $dbPort"
Write-Host "  Database: $dbName"
Write-Host "  User: $dbUser"
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# Run SQL migration
$migrationFile = "prisma\migrations\20250115000002_add_tour_moderation_fields\migration.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Running SQL migration..." -ForegroundColor Cyan

try {
    $result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $migrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Tour moderation migration applied!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: SQL migration failed!" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to run psql command!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD
}

Write-Host ""
Write-Host "Next step: Run 'npx prisma generate' to update Prisma Client" -ForegroundColor Yellow



