#!/bin/bash
# Bash script to apply platform fee and standby fields migration
# This script reads DATABASE_URL from .env and applies the SQL migration

set -e

echo "Applying platform fee and standby fields migration..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Read .env file
ENV_FILE="$PROJECT_ROOT/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# Parse DATABASE_URL from .env
DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not found in .env"
    exit 1
fi

# Parse connection details
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "ERROR: Invalid DATABASE_URL format"
    exit 1
fi

echo "Database connection:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Get migration SQL file path
MIGRATION_FILE="$PROJECT_ROOT/prisma/migrations/20250115000004_add_platform_fee_and_standby_fields/migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "ERROR: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "Running SQL migration..."

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DB_PASSWORD"

# Run psql command
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    echo "SUCCESS: Migration applied successfully!"
else
    echo "ERROR: Migration failed!"
    exit 1
fi

# Clear password from environment
unset PGPASSWORD

echo ""
echo "Next steps:"
echo "1. Run: npx prisma generate"
echo "2. Restart your dev server"

