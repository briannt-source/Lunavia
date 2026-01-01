-- Script SQL để kiểm tra duplicate data trong bảng companies
-- Chạy script này TRƯỚC KHI chạy migration add_company_unique_constraints

-- 1. Kiểm tra duplicate email
SELECT 
    email, 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as company_ids
FROM companies 
WHERE email IS NOT NULL AND email != ''
GROUP BY email 
HAVING COUNT(*) > 1;

-- 2. Kiểm tra duplicate businessLicenseNumber
SELECT 
    "businessLicenseNumber", 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as company_ids
FROM companies 
WHERE "businessLicenseNumber" IS NOT NULL AND "businessLicenseNumber" != ''
GROUP BY "businessLicenseNumber" 
HAVING COUNT(*) > 1;

-- 3. Kiểm tra duplicate travelLicenseNumber
SELECT 
    "travelLicenseNumber", 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as company_ids
FROM companies 
WHERE "travelLicenseNumber" IS NOT NULL AND "travelLicenseNumber" != ''
GROUP BY "travelLicenseNumber" 
HAVING COUNT(*) > 1;

-- 4. Tổng hợp: Có bao nhiêu companies có duplicate data?
SELECT 
    (SELECT COUNT(DISTINCT email) FROM (
        SELECT email, COUNT(*) 
        FROM companies 
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) as dup_emails) as duplicate_emails,
    (SELECT COUNT(DISTINCT "businessLicenseNumber") FROM (
        SELECT "businessLicenseNumber", COUNT(*) 
        FROM companies 
        WHERE "businessLicenseNumber" IS NOT NULL AND "businessLicenseNumber" != ''
        GROUP BY "businessLicenseNumber" 
        HAVING COUNT(*) > 1
    ) as dup_licenses) as duplicate_licenses,
    (SELECT COUNT(DISTINCT "travelLicenseNumber") FROM (
        SELECT "travelLicenseNumber", COUNT(*) 
        FROM companies 
        WHERE "travelLicenseNumber" IS NOT NULL AND "travelLicenseNumber" != ''
        GROUP BY "travelLicenseNumber" 
        HAVING COUNT(*) > 1
    ) as dup_travel_licenses) as duplicate_travel_licenses;



