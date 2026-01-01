# Fix Migration Conflicts Script
# This script fixes enum conflicts by checking if types exist before creating them

$ErrorActionPreference = "Stop"

Write-Host "Checking database connection..." -ForegroundColor Cyan

# Read DATABASE_URL from .env
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw
$dbUrlMatch = [regex]::Match($envContent, 'DATABASE_URL\s*=\s*["'']?([^"'']+)["'']?')
if (-not $dbUrlMatch.Success) {
    Write-Host "ERROR: DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

$databaseUrl = $dbUrlMatch.Groups[1].Value
Write-Host "Database URL found" -ForegroundColor Green

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
$urlPattern = 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
$urlMatch = [regex]::Match($databaseUrl, $urlPattern)

if (-not $urlMatch.Success) {
    Write-Host "ERROR: Invalid DATABASE_URL format!" -ForegroundColor Red
    exit 1
}

$dbUser = $urlMatch.Groups[1].Value
$dbPassword = $urlMatch.Groups[2].Value
$dbHost = $urlMatch.Groups[3].Value
$dbPort = $urlMatch.Groups[4].Value
$dbName = $urlMatch.Groups[5].Value

Write-Host "Connecting to database: ${dbName}@${dbHost}:${dbPort}" -ForegroundColor Cyan

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# Check if UserBlockReason enum exists
Write-Host "`nChecking UserBlockReason enum..." -ForegroundColor Cyan
$checkUserBlockReason = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserBlockReason');" 2>&1
$userBlockReasonExists = ($checkUserBlockReason -match 't')

if ($userBlockReasonExists) {
    Write-Host "UserBlockReason enum already exists" -ForegroundColor Yellow
} else {
    Write-Host "UserBlockReason enum does not exist" -ForegroundColor Green
}

# Check if EscrowStatus enum exists
Write-Host "`nChecking EscrowStatus enum..." -ForegroundColor Cyan
$checkEscrowStatus = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EscrowStatus');" 2>&1
$escrowStatusExists = ($checkEscrowStatus -match 't')

if ($escrowStatusExists) {
    Write-Host "EscrowStatus enum already exists" -ForegroundColor Yellow
} else {
    Write-Host "EscrowStatus enum does not exist" -ForegroundColor Green
}

# Check if escrow_accounts table exists
Write-Host "`nChecking escrow_accounts table..." -ForegroundColor Cyan
$checkEscrowTable = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrow_accounts');" 2>&1
$escrowTableExists = ($checkEscrowTable -match 't')

if ($escrowTableExists) {
    Write-Host "escrow_accounts table already exists" -ForegroundColor Yellow
} else {
    Write-Host "escrow_accounts table does not exist" -ForegroundColor Green
}

# Create fixed migration SQL
Write-Host "`nCreating fixed migration SQL..." -ForegroundColor Cyan

$fixedMigration = @"
-- Fixed Escrow System Migration
-- Checks for existing types before creating them

-- Create EscrowStatus enum (if not exists)
DO `$`$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EscrowStatus') THEN
        CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'LOCKED', 'RELEASED', 'REFUNDED', 'CANCELLED');
    END IF;
END
`$`$;

-- Create EscrowAccount model
CREATE TABLE IF NOT EXISTS "escrow_accounts" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "guideId" TEXT NOT NULL,
  "tourId" TEXT,
  "standbyRequestId" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netAmount" DOUBLE PRECISION NOT NULL,
  "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
  "lockedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "releaseReason" TEXT,
  "refundReason" TEXT,
  "cancelledReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "escrow_accounts_pkey" PRIMARY KEY ("id")
);

-- Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS "escrow_accounts_operatorId_idx" ON "escrow_accounts"("operatorId");
CREATE INDEX IF NOT EXISTS "escrow_accounts_guideId_idx" ON "escrow_accounts"("guideId");
CREATE INDEX IF NOT EXISTS "escrow_accounts_tourId_idx" ON "escrow_accounts"("tourId");

-- Add foreign keys (if not exists)
DO `$`$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_accounts_operatorId_fkey') THEN
        ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_accounts_guideId_fkey') THEN
        ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_accounts_tourId_fkey') THEN
        ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'escrow_accounts_standbyRequestId_fkey') THEN
        ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_standbyRequestId_fkey" FOREIGN KEY ("standbyRequestId") REFERENCES "standby_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
`$`$;

-- Add escrowAccountId to Payment model (if not exists)
DO `$`$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'escrowAccountId') THEN
        ALTER TABLE "payments" ADD COLUMN "escrowAccountId" TEXT;
    END IF;
END
`$`$;

-- Add foreign key for escrowAccountId (if not exists)
DO `$`$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_escrowAccountId_fkey') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_escrowAccountId_fkey" FOREIGN KEY ("escrowAccountId") REFERENCES "escrow_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
`$`$;

-- Create index for escrowAccountId (if not exists)
CREATE INDEX IF NOT EXISTS "payments_escrowAccountId_idx" ON "payments"("escrowAccountId");
"@

$fixedMigrationPath = Join-Path $PSScriptRoot ".." "prisma" "migrations" "20250115000005_add_escrow_system" "migration_fixed.sql"
$fixedMigrationDir = Split-Path $fixedMigrationPath -Parent
if (-not (Test-Path $fixedMigrationDir)) {
    New-Item -ItemType Directory -Path $fixedMigrationDir -Force | Out-Null
}
$fixedMigration | Out-File -FilePath $fixedMigrationPath -Encoding UTF8

Write-Host "Fixed migration SQL created: $fixedMigrationPath" -ForegroundColor Green

# Apply fixed migration
Write-Host "`nApplying fixed migration..." -ForegroundColor Cyan
$result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $fixedMigrationPath 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed:" -ForegroundColor Red
    Write-Host $result
    exit 1
}

Write-Host "`nMigration completed successfully!" -ForegroundColor Green

