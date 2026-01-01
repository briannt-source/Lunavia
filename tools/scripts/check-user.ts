import { PrismaClient } from '@prisma/client';
import { WalletService } from '../src/domain/services/wallet.service';

const prisma = new PrismaClient();

async function checkUser(email: string) {
  console.log(`\n🔍 Đang kiểm tra tài khoản: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      wallet: true,
      verifications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    console.log('❌ Tài khoản không tồn tại!');
    return;
  }

  console.log('✅ Tài khoản tồn tại!\n');
  console.log('📋 Thông tin cơ bản:');
  console.log(`   - ID: ${user.id}`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Role: ${user.role}`);
  console.log(`   - License Number: ${user.licenseNumber || 'Chưa có'}`);
  console.log(`   - Verified Status: ${user.verifiedStatus}`);
  console.log(`   - Employment Type: ${user.employmentType || 'Chưa có'}`);
  console.log(`   - Created At: ${user.createdAt}`);

  if (user.profile) {
    console.log('\n👤 Profile:');
    console.log(`   - Name: ${user.profile.name || 'Chưa có'}`);
    console.log(`   - Company Name: ${user.profile.companyName || 'Chưa có'}`);
    console.log(`   - Languages: ${user.profile.languages.join(', ') || 'Chưa có'}`);
    console.log(`   - Specialties: ${user.profile.specialties.join(', ') || 'Chưa có'}`);
  } else {
    console.log('\n❌ Chưa có Profile');
  }

  if (user.wallet) {
    console.log('\n💰 Wallet:');
    console.log(`   - Balance: ${user.wallet.balance.toLocaleString('vi-VN')} VND`);
    console.log(`   - Locked Deposit: ${user.wallet.lockedDeposit.toLocaleString('vi-VN')} VND`);
    console.log(`   - Reserved: ${user.wallet.reserved.toLocaleString('vi-VN')} VND`);
    console.log(`   - Available: ${(user.wallet.balance - user.wallet.reserved).toLocaleString('vi-VN')} VND`);
  } else {
    console.log('\n❌ Chưa có Wallet');
  }

  if (user.verifications.length > 0) {
    const verification = user.verifications[0];
    console.log('\n🛡️ Verification:');
    console.log(`   - Status: ${verification.status}`);
    console.log(`   - Created At: ${verification.createdAt}`);
    if (verification.adminNotes) {
      console.log(`   - Admin Notes: ${verification.adminNotes}`);
    }
  } else {
    console.log('\n⚠️ Chưa có Verification record');
  }

  // Check permissions
  console.log('\n🔐 Quyền và khả năng:');
  
  const canCreate = await WalletService.canCreateTour(user.id);
  console.log(`   - Có thể tạo tour: ${canCreate.canCreate ? '✅ CÓ' : '❌ KHÔNG'}`);
  if (!canCreate.canCreate) {
    console.log(`     Lý do: ${canCreate.reason}`);
  }

  const canApply = await WalletService.canApplyToTour(user.id);
  console.log(`   - Có thể apply tour: ${canApply.canApply ? '✅ CÓ' : '❌ KHÔNG'}`);
  if (!canApply.canApply) {
    console.log(`     Lý do: ${canApply.reason}`);
  }

  // Summary
  console.log('\n📊 Tóm tắt:');
  const issues: string[] = [];
  
  if (!user.licenseNumber && (user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY')) {
    issues.push('❌ Thiếu license number');
  }
  
  if (user.verifiedStatus !== 'APPROVED') {
    issues.push(`❌ Chưa được verify (${user.verifiedStatus})`);
  }
  
  if (!user.wallet) {
    issues.push('❌ Chưa có wallet');
  } else if (user.wallet.lockedDeposit < 1000000 && (user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY')) {
    issues.push(`❌ Deposit không đủ (cần 1,000,000 VND, hiện có ${user.wallet.lockedDeposit.toLocaleString('vi-VN')} VND)`);
  }

  if (issues.length === 0) {
    console.log('   ✅ Tài khoản đầy đủ điều kiện!');
  } else {
    console.log('   ⚠️ Các vấn đề cần sửa:');
    issues.forEach(issue => console.log(`      ${issue}`));
  }

  console.log('\n');
}

async function main() {
  const email = process.argv[2] || 'admin@lunavia.test';
  await checkUser(email);
  await prisma.$disconnect();
}

main().catch(console.error);








