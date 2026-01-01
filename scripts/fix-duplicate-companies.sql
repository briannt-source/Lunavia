-- Script SQL để xử lý duplicate data trong bảng companies
-- ⚠️ CHẠY CẨN THẬN - Script này sẽ XÓA các record duplicate
-- ⚠️ BACKUP DATABASE TRƯỚC KHI CHẠY!

-- Strategy: Giữ lại record đầu tiên (theo createdAt), xóa các record sau

-- 1. Xử lý duplicate email - Giữ record đầu tiên, xóa các record sau
DELETE FROM companies 
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY "createdAt" ASC) as rn
        FROM companies 
        WHERE email IS NOT NULL AND email != ''
    ) as ranked
    WHERE rn > 1
);

-- 2. Xử lý duplicate businessLicenseNumber - Giữ record đầu tiên, xóa các record sau
DELETE FROM companies 
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM("businessLicenseNumber")) ORDER BY "createdAt" ASC) as rn
        FROM companies 
        WHERE "businessLicenseNumber" IS NOT NULL AND "businessLicenseNumber" != ''
    ) as ranked
    WHERE rn > 1
);

-- 3. Xử lý duplicate travelLicenseNumber - Giữ record đầu tiên, xóa các record sau
DELETE FROM companies 
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM("travelLicenseNumber")) ORDER BY "createdAt" ASC) as rn
        FROM companies 
        WHERE "travelLicenseNumber" IS NOT NULL AND "travelLicenseNumber" != ''
    ) as ranked
    WHERE rn > 1
);

-- 4. Sau khi xóa, set NULL cho các field duplicate còn lại (nếu cần)
-- Chỉ chạy nếu muốn giữ lại các record nhưng set NULL cho duplicate fields
-- UPDATE companies SET email = NULL WHERE id IN (SELECT id FROM ...);



