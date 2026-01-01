# PowerShell script to run SQL migration manually
# This script reads database connection from .env and runs the SQL migration

Write-Host "Running SQL migration manually..." -ForegroundColor Cyan
Write-Host ""

# Read .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

# Parse .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        if ($value -match '^["''](.+)["'']$') {
            $value = $matches[1]
        }
        $envVars[$key] = $value
    }
}

# Get database connection info
$dbUrl = $envVars["DATABASE_URL"]
if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

# Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
# Handle both with and without query parameters
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    # Remove quotes if present
    $dbName = $dbName.Trim('"').Trim("'")
} else {
    Write-Host "ERROR: Could not parse DATABASE_URL!" -ForegroundColor Red
    Write-Host "DATABASE_URL format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
    Write-Host "Current value: $dbUrl" -ForegroundColor Gray
    exit 1
}

Write-Host "Database connection:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: psql command not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools or run the SQL manually using a database client." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL file location: scripts/apply-migration.sql" -ForegroundColor Cyan
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# Run SQL migration
Write-Host "Running SQL migration..." -ForegroundColor Yellow
$sqlFile = "scripts/apply-migration.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

# Escape password for special characters
$env:PGPASSWORD = $dbPassword

# Run psql command
Write-Host "Executing: psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile" -ForegroundColor Gray
$result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: SQL migration applied!" -ForegroundColor Green
} else {
    Write-Host "ERROR: SQL migration failed!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run generate:tour-codes" -ForegroundColor Yellow
Write-Host "2. Run: npm run generate:user-codes" -ForegroundColor Yellow
Write-Host "3. Run: npm run migrate:company" -ForegroundColor Yellow

