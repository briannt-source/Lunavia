#!/bin/bash
# Bash script to apply user block fields migration
# This script applies the SQL migration directly to the database

echo "Applying user block fields migration..."

# Read DATABASE_URL from .env
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    exit 1
fi

DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not found in .env file!"
    exit 1
fi

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "ERROR: Invalid DATABASE_URL format!"
    exit 1
fi

echo "Database connection:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# SQL file path
SQL_FILE="prisma/migrations/20250115000003_add_user_block_fields/migration.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "ERROR: SQL migration file not found: $SQL_FILE"
    exit 1
fi

echo ""
echo "Running SQL migration..."

# Run psql command
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "SUCCESS: User block fields migration applied!"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npx prisma generate"
    echo "  2. Restart your dev server"
else
    echo ""
    echo "ERROR: SQL migration failed!"
    exit 1
fi

# Clear PGPASSWORD
unset PGPASSWORD

