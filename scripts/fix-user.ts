import { PrismaClient } from '@prisma/client';
import { WalletService } from '../src/domain/services/wallet.service';

const prisma = new PrismaClient();

async function fixUser(email: string) {
  console.log(`\n🔧 Đang sửa tài khoản: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      wallet: true,
    },
  });

  if (!user) {
    console.log('❌ Tài khoản không tồn tại!');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Tài khoản tồn tại, đang cập nhật...\n');

  // Update user
  const updates: any = {};

  // Add license number if missing and is operator/agency
  if (!user.licenseNumber && (user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY')) {
    updates.licenseNumber = `OP${Date.now().toString().slice(-6)}`;
    console.log(`✅ Thêm license number: ${updates.licenseNumber}`);
  }

  // Update verification status
  if (user.verifiedStatus !== 'APPROVED') {
    updates.verifiedStatus = 'APPROVED';
    console.log('✅ Cập nhật verified status: APPROVED');
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
  }

  // Create profile if missing
  if (!user.profile) {
    await prisma.profile.create({
      data: {
        userId: user.id,
        name: user.email.split('@')[0],
        companyName: user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY' 
          ? `${user.email.split('@')[0]} Company`
          : null,
        languages: ['Tiếng Việt', 'English'],
        specialties: user.role === 'TOUR_GUIDE' ? ['Văn hóa', 'Lịch sử'] : [],
      },
    });
    console.log('✅ Tạo profile');
  }

  // Create wallet if missing
  if (!user.wallet) {
    await WalletService.initializeWallet(user.id, user.role);
    console.log('✅ Tạo wallet');
    
    // For operators/agencies, ensure they have the minimum deposit
    if (user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY') {
      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: 5000000, // 5M VND
          lockedDeposit: 1000000, // 1M VND minimum
        },
      });
      console.log('✅ Cập nhật wallet: balance 5M, lockedDeposit 1M');
    } else if (user.role === 'TOUR_GUIDE') {
      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: 1000000, // 1M VND (more than minimum 500k)
        },
      });
      console.log('✅ Cập nhật wallet: balance 1M');
    }
  } else {
    // Update wallet if needed
    if (user.role === 'TOUR_OPERATOR' || user.role === 'TOUR_AGENCY') {
      if (user.wallet.lockedDeposit < 1000000) {
        await prisma.wallet.update({
          where: { userId: user.id },
          data: {
            lockedDeposit: 1000000,
            balance: Math.max(user.wallet.balance, 5000000),
          },
        });
        console.log('✅ Cập nhật wallet: đảm bảo deposit >= 1M');
      }
    }
  }

  // Create verification record if missing
  const existingVerification = await prisma.verification.findFirst({
    where: { userId: user.id },
  });

  if (!existingVerification) {
    await prisma.verification.create({
      data: {
        userId: user.id,
        status: 'APPROVED',
        documents: [],
        adminNotes: 'Auto-approved by system',
      },
    });
    console.log('✅ Tạo verification record: APPROVED');
  }

  console.log('\n✅ Hoàn tất! Tài khoản đã được cập nhật.\n');

  // Verify again
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      wallet: true,
    },
  });

  const canCreate = await WalletService.canCreateTour(user.id);
  console.log('📊 Kiểm tra lại:');
  console.log(`   - Có thể tạo tour: ${canCreate.canCreate ? '✅ CÓ' : '❌ KHÔNG'}`);
  if (!canCreate.canCreate) {
    console.log(`     Lý do: ${canCreate.reason}`);
  }

  console.log('\n');
}

async function main() {
  const email = process.argv[2] || 'admin@lunavia.test';
  await fixUser(email);
  await prisma.$disconnect();
}

main().catch(console.error);








