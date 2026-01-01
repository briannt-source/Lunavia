# PowerShell script to run Company Unique Constraints migration SQL
# This script reads database connection from .env and runs the SQL migration

Write-Host "Running Company Unique Constraints migration..." -ForegroundColor Cyan
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

# Parse DATABASE_URL
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    $dbName = $dbName.Trim('"').Trim("'")
} else {
    Write-Host "ERROR: Could not parse DATABASE_URL!" -ForegroundColor Red
    exit 1
}

# Check if psql is available
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: psql command not found!" -ForegroundColor Red
    exit 1
}

# Set PGPASSWORD
$env:PGPASSWORD = $dbPassword

# Run SQL migration
$sqlFile = "prisma/migrations/20250115000001_add_company_unique_constraints/migration.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executing SQL migration..." -ForegroundColor Yellow
$result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Company Unique Constraints migration applied!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}



