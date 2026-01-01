import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { WalletService } from '../src/domain/services/wallet.service';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('\n🚀 Đang tạo các tài khoản test...\n');

  // 1. Create Tour Guide
  console.log('📝 Tạo Tour Guide...');
  const guidePassword = await bcrypt.hash('password123', 10);
  
  const guide = await prisma.user.upsert({
    where: { email: 'guide@lunavia.test' },
    update: {},
    create: {
      email: 'guide@lunavia.test',
      password: guidePassword,
      role: 'TOUR_GUIDE',
      verifiedStatus: 'APPROVED',
      profile: {
        create: {
          name: 'Test Guide',
          languages: ['Tiếng Việt', 'English', '中文'],
          specialties: ['Văn hóa', 'Lịch sử', 'Ẩm thực'],
          experienceYears: 5,
          rating: 4.8,
          reviewCount: 25,
        },
      },
    },
  });

  // Initialize wallet for guide
  await WalletService.initializeWallet(guide.id, 'TOUR_GUIDE');
  await prisma.wallet.update({
    where: { userId: guide.id },
    data: {
      balance: 2000000, // 2M VND (more than minimum 500k)
    },
  });

  // Create verification if not exists
  const existingVerification = await prisma.verification.findFirst({
    where: { userId: guide.id },
  });

  if (!existingVerification) {
    await prisma.verification.create({
      data: {
        userId: guide.id,
        status: 'APPROVED',
        documents: [],
        adminNotes: 'Test guide account - auto approved',
      },
    });
  }

  console.log('✅ Tour Guide đã được tạo:');
  console.log(`   Email: guide@lunavia.test`);
  console.log(`   Password: password123`);
  console.log(`   Role: TOUR_GUIDE`);
  console.log(`   Balance: 2,000,000 VND\n`);

  // 2. Create Admin User
  console.log('📝 Tạo Admin User...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@lunavia.test' },
    update: {},
    create: {
      email: 'admin@lunavia.test',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      permissions: ['DISPUTES', 'TRANSFERS', 'PASSWORD_RESET', 'PROFILE_MGMT'],
    },
  });

  console.log('✅ Admin User đã được tạo:');
  console.log(`   Email: admin@lunavia.test`);
  console.log(`   Password: admin123`);
  console.log(`   Role: SUPER_ADMIN`);
  console.log(`   Permissions: DISPUTES, TRANSFERS, PASSWORD_RESET, PROFILE_MGMT\n`);

  // 3. Create Moderator
  console.log('📝 Tạo Moderator...');
  const modPassword = await bcrypt.hash('mod123', 10);
  
  const moderator = await prisma.adminUser.upsert({
    where: { email: 'mod@lunavia.test' },
    update: {},
    create: {
      email: 'mod@lunavia.test',
      password: modPassword,
      role: 'MODERATOR',
      permissions: ['DISPUTES', 'TRANSFERS'],
    },
  });

  console.log('✅ Moderator đã được tạo:');
  console.log(`   Email: mod@lunavia.test`);
  console.log(`   Password: mod123`);
  console.log(`   Role: MODERATOR`);
  console.log(`   Permissions: DISPUTES, TRANSFERS\n`);

  // 4. Create Support Staff
  console.log('📝 Tạo Support Staff...');
  const supportPassword = await bcrypt.hash('support123', 10);
  
  const support = await prisma.adminUser.upsert({
    where: { email: 'support@lunavia.test' },
    update: {},
    create: {
      email: 'support@lunavia.test',
      password: supportPassword,
      role: 'SUPPORT_STAFF',
      permissions: ['PASSWORD_RESET', 'PROFILE_MGMT'],
    },
  });

  console.log('✅ Support Staff đã được tạo:');
  console.log(`   Email: support@lunavia.test`);
  console.log(`   Password: support123`);
  console.log(`   Role: SUPPORT_STAFF`);
  console.log(`   Permissions: PASSWORD_RESET, PROFILE_MGMT\n`);

  // Verify guide can apply
  const canApply = await WalletService.canApplyToTour(guide.id);
  console.log('🔐 Kiểm tra quyền Tour Guide:');
  console.log(`   - Có thể apply tour: ${canApply.canApply ? '✅ CÓ' : '❌ KHÔNG'}`);
  if (!canApply.canApply) {
    console.log(`     Lý do: ${canApply.reason}`);
  }

  console.log('\n✅ Hoàn tất! Tất cả tài khoản đã được tạo.\n');
  console.log('📋 Tóm tắt tài khoản:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Tour Guide:');
  console.log('   Email: guide@lunavia.test');
  console.log('   Password: password123');
  console.log('   Dashboard: /dashboard/guide');
  console.log('');
  console.log('2. Admin (Super Admin):');
  console.log('   Email: admin@lunavia.test');
  console.log('   Password: admin123');
  console.log('   Dashboard: /dashboard/admin');
  console.log('');
  console.log('3. Moderator:');
  console.log('   Email: mod@lunavia.test');
  console.log('   Password: mod123');
  console.log('   Dashboard: /dashboard/admin');
  console.log('');
  console.log('4. Support Staff:');
  console.log('   Email: support@lunavia.test');
  console.log('   Password: support123');
  console.log('   Dashboard: /dashboard/admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

