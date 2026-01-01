# PowerShell script to run all migrations
# Usage: .\scripts\run-migrations.ps1

Write-Host "Starting migrations..." -ForegroundColor Cyan
Write-Host ""

# Check if Prisma is installed
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npx not found. Please install Node.js and npm." -ForegroundColor Red
    exit 1
}

# Step 1: Apply migration SQL manually (if needed)
Write-Host "Step 1: Applying SQL migration..." -ForegroundColor Yellow
npm run migrate:sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: SQL migration failed or skipped. Continuing..." -ForegroundColor Yellow
    Write-Host "   You may need to run it manually: npm run migrate:sql" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Generate Prisma Client
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma Client!" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Prisma Client generated!" -ForegroundColor Green
Write-Host ""

# Migration 1: UserSettings (already marked as applied, but need to verify)
Write-Host "Migration 1: UserSettings Model" -ForegroundColor Yellow
Write-Host "   This migration should already be applied." -ForegroundColor Gray
Write-Host "   If columns are missing, run: psql -f scripts/apply-migration.sql" -ForegroundColor Gray
Write-Host ""

# Step 3: Backfill tour codes
Write-Host "Step 3: Backfilling tour codes..." -ForegroundColor Yellow
npm run generate:tour-codes
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Tour codes backfill failed. You may need to run it manually later." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Backfill user codes
Write-Host "Step 4: Backfilling user codes..." -ForegroundColor Yellow
npm run generate:user-codes
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: User codes backfill failed. You may need to run it manually later." -ForegroundColor Yellow
}
Write-Host ""

# Migration 2: Company Unique Constraints
Write-Host "Migration 2: Company Unique Constraints" -ForegroundColor Yellow
Write-Host "   Adding unique constraints for email, businessLicenseNumber, travelLicenseNumber..." -ForegroundColor Gray
npm run migrate:company-sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration 2 failed!" -ForegroundColor Red
    Write-Host "   This might be due to duplicate data. Please check and fix before running again." -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Migration 2 completed!" -ForegroundColor Green
Write-Host ""

Write-Host "All migrations completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Checking migration status:" -ForegroundColor Cyan
npx prisma migrate status
