#!/bin/bash
# Bash script để chạy tất cả migrations
# Usage: ./scripts/run-migrations.sh

echo "🔄 Bắt đầu chạy migrations..."
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx không được tìm thấy. Vui lòng cài đặt Node.js và npm."
    exit 1
fi

# Migration 1: UserSettings
echo "📦 Migration 1: UserSettings Model"
echo "   Thêm model UserSettings với các fields cho Settings..."
npx prisma migrate dev --name add_user_settings
if [ $? -ne 0 ]; then
    echo "❌ Migration 1 thất bại!"
    echo "   Vui lòng kiểm tra lỗi và thử lại."
    exit 1
fi
echo "✅ Migration 1 hoàn thành!"
echo ""

# Migration 2: Company Unique Constraints
echo "📦 Migration 2: Company Unique Constraints"
echo "   Thêm unique constraints cho email, businessLicenseNumber, travelLicenseNumber..."
npx prisma migrate dev --name add_company_unique_constraints
if [ $? -ne 0 ]; then
    echo "❌ Migration 2 thất bại!"
    echo "   Có thể do dữ liệu duplicate. Vui lòng kiểm tra và xử lý trước khi chạy lại."
    exit 1
fi
echo "✅ Migration 2 hoàn thành!"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Generate Prisma Client thất bại!"
    exit 1
fi
echo "✅ Prisma Client đã được generate!"
echo ""

echo "✅ Tất cả migrations đã hoàn thành thành công!"
echo ""
echo "📊 Kiểm tra migration status:"
npx prisma migrate status



