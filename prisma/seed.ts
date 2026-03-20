import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate Company ID
async function generateCompanyId(prisma: PrismaClient, companyName: string): Promise<string> {
  const words = companyName.trim().split(/\s+/);
  const initials = words
    .map((word) => word.charAt(0).toUpperCase())
    .filter((char) => /[A-Z]/.test(char))
    .join('');

  if (initials.length === 0) {
    return `COM-${Date.now()}`;
  }

  const existingCompanies = await prisma.company.findMany({
    where: {
      companyId: {
        startsWith: initials + '-',
      },
    },
    orderBy: {
      companyId: 'desc',
    },
    take: 1,
  });

  let sequence = 1;
  if (existingCompanies.length > 0) {
    const lastCompanyId = existingCompanies[0].companyId;
    const lastSequence = parseInt(lastCompanyId.split('-')[1] || '0');
    sequence = lastSequence + 1;
  }

  return `${initials}-${sequence.toString().padStart(3, '0')}`;
}

async function main() {
  console.log('🌱 Starting seed...');

  const PASSWORD = 'Lunavia@123';
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // Seed Cities
  console.log('📍 Seeding cities...');
  const cities = [
    { name: 'Hà Nội', region: 'Miền Bắc', code: 'HAN', country: 'VN' },
    { name: 'TP. Hồ Chí Minh', region: 'Miền Nam', code: 'SGN', country: 'VN' },
    { name: 'Đà Nẵng', region: 'Miền Trung', code: 'DAD', country: 'VN' },
    { name: 'Hội An', region: 'Miền Trung', code: 'HOA', country: 'VN' },
    { name: 'Đà Lạt', region: 'Miền Nam', code: 'DLI', country: 'VN' },
    { name: 'Nha Trang', region: 'Miền Trung', code: 'NHA', country: 'VN' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: {},
      create: city,
    });
  }

  // Seed Exchange Rate
  console.log('💱 Seeding exchange rate...');
  await prisma.exchangeRate.upsert({
    where: { id: 'default-usd-vnd' },
    update: {},
    create: {
      id: 'default-usd-vnd',
      fromCurrency: 'USD',
      toCurrency: 'VND',
      rate: 26000,
      effectiveFrom: new Date(),
    },
  });

  // Create 8 Tour Operators
  const operators = [];
  for (let i = 1; i <= 8; i++) {
    const operator = await prisma.user.upsert({
      where: { email: `operator${i}@lunavia.vn` },
      update: {},
      create: {
        email: `operator${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'TOUR_OPERATOR',
        licenseNumber: `OP${String(i).padStart(6, '0')}`,
        verifiedStatus: 'APPROVED',
        profile: {
          create: {
            name: `Tour Operator ${i}`,
            companyName: `Travel Company ${i}`,
            languages: ['Tiếng Việt', 'English'],
            specialties: ['Văn hóa', 'Lịch sử'],
          },
        },
        wallet: {
          create: {
            balance: 5000000,
          },
        },
      },
    });
    operators.push(operator);

    // Create Company for operator
    const companyName = `Travel Company ${i}`;
    const companyId = await generateCompanyId(prisma, companyName);
    
    await prisma.company.upsert({
      where: { operatorId: operator.id },
      update: {},
      create: {
        companyId,
        name: companyName,
        operatorId: operator.id,
        email: `company${i}@lunavia.vn`,
        website: `https://company${i}.lunavia.vn`,
        address: `${i} Đường ABC, Quận XYZ, TP. Hồ Chí Minh`,
        businessLicenseNumber: `BL${String(i).padStart(6, '0')}`,
        travelLicenseNumber: `TL${String(i).padStart(6, '0')}`,
      },
    });
  }

  // Create 5 Tour Agencies
  const agencies = [];
  for (let i = 1; i <= 5; i++) {
    const agency = await prisma.user.upsert({
      where: { email: `agency${i}@lunavia.vn` },
      update: {},
      create: {
        email: `agency${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'TOUR_AGENCY',
        licenseNumber: `AG${String(i).padStart(6, '0')}`,
        verifiedStatus: 'APPROVED',
        profile: {
          create: {
            name: `Tour Agency ${i}`,
            companyName: `Agency ${i} Co.`,
            languages: ['Tiếng Việt', 'English', '中文'],
            specialties: ['Ẩm thực', 'Du lịch sinh thái'],
          },
        },
        wallet: {
          create: {
            balance: 8000000,
          },
        },
      },
    });
    agencies.push(agency);
  }

  // Create 25 Tour Guides
  const guides = [];
  for (let i = 1; i <= 25; i++) {
    const guide = await prisma.user.upsert({
      where: { email: `guide${i}@lunavia.vn` },
      update: {},
      create: {
        email: `guide${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'TOUR_GUIDE',
        verifiedStatus: 'APPROVED',
        profile: {
          create: {
            name: `Guide ${i}`,
            languages: i % 3 === 0 
              ? ['Tiếng Việt', 'English', 'Français']
              : i % 2 === 0
              ? ['Tiếng Việt', 'English']
              : ['Tiếng Việt', '中文'],
            experienceYears: Math.floor(Math.random() * 10) + 1,
            specialties: [
              'Văn hóa',
              ...(i % 2 === 0 ? ['Lịch sử'] : []),
              ...(i % 3 === 0 ? ['Ẩm thực'] : []),
            ],
            rating: 4.0 + Math.random() * 1.0,
            reviewCount: Math.floor(Math.random() * 50),
          },
        },
        wallet: {
          create: {
            balance: 500000 + Math.random() * 2000000,
          },
        },
      },
    });
    guides.push(guide);
  }

  // Create Admin Users (internal staff)
  console.log('👑 Seeding admin accounts...');
  
  // Super Admin
  await prisma.adminUser.upsert({
    where: { email: 'admin@lunavia.vn' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@lunavia.vn',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      permissions: ['TRUST_ADJUST', 'TRUST_RESET', 'TRUST_VIEW_HISTORY', 'FINANCE_APPROVE_TOPUP', 'FINANCE_APPROVE_REFUND', 'FINANCE_ADJUST_CREDIT', 'FINANCE_VIEW_TRANSACTIONS', 'DISPUTE_VIEW', 'DISPUTE_RESOLVE', 'SOS_VIEW', 'SOS_OPEN'],
    },
  });

  // OPS/CS Staff
  for (let i = 1; i <= 2; i++) {
    await prisma.adminUser.upsert({
      where: { email: `ops${i}@lunavia.vn` },
      update: { password: hashedPassword },
      create: {
        email: `ops${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'OPS_CS',
        permissions: ['DISPUTE_VIEW', 'DISPUTE_OPEN', 'SOS_VIEW', 'SOS_OPEN'],
      },
    });
  }

  // Moderators
  for (let i = 1; i <= 3; i++) {
    await prisma.adminUser.upsert({
      where: { email: `moderator${i}@lunavia.vn` },
      update: { password: hashedPassword },
      create: {
        email: `moderator${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'MODERATOR',
        permissions: ['DISPUTE_VIEW', 'DISPUTE_RESOLVE', 'TRUST_VIEW_HISTORY'],
      },
    });
  }

  // Finance
  for (let i = 1; i <= 2; i++) {
    await prisma.adminUser.upsert({
      where: { email: `finance${i}@lunavia.vn` },
      update: { password: hashedPassword },
      create: {
        email: `finance${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'FINANCE',
        permissions: ['FINANCE_APPROVE_TOPUP', 'FINANCE_APPROVE_REFUND', 'FINANCE_ADJUST_CREDIT', 'FINANCE_VIEW_TRANSACTIONS'],
      },
    });
  }

  // Finance Lead
  await prisma.adminUser.upsert({
    where: { email: 'finance-lead@lunavia.vn' },
    update: { password: hashedPassword },
    create: {
      email: 'finance-lead@lunavia.vn',
      password: hashedPassword,
      role: 'FINANCE_LEAD',
      permissions: ['FINANCE_APPROVE_TOPUP', 'FINANCE_APPROVE_REFUND', 'FINANCE_ADJUST_CREDIT', 'FINANCE_VIEW_TRANSACTIONS', 'TRUST_VIEW_HISTORY'],
    },
  });

  // Support Staff
  for (let i = 1; i <= 5; i++) {
    await prisma.adminUser.upsert({
      where: { email: `support${i}@lunavia.vn` },
      update: { password: hashedPassword },
      create: {
        email: `support${i}@lunavia.vn`,
        password: hashedPassword,
        role: 'SUPPORT_STAFF',
        permissions: ['DISPUTE_VIEW', 'SOS_VIEW'],
      },
    });
  }

  // Seed Trust & Deposit Configs
  console.log('⚙️  Seeding platform configs...');
  await prisma.trustConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      goodMin: 80,
      atRiskMin: 50,
      restrictedMax: 49,
      blockCreateTourBelow: 50,
      blockApplyTourBelow: 50,
    },
  });

  await prisma.depositConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      operatorOnboardingLock: 1000000,
      guideOnboardingLock: 500000,
      perTourLockAmount: 0,
    },
  });

  // Create 20 Disputes
  const disputeTypes: Array<'PAYMENT' | 'ASSIGNMENT' | 'NO_SHOW' | 'QUALITY'> = 
    ['PAYMENT', 'ASSIGNMENT', 'NO_SHOW', 'QUALITY'];
  
  for (let i = 0; i < 20; i++) {
    const user = [...operators, ...agencies, ...guides][Math.floor(Math.random() * (operators.length + agencies.length + guides.length))];
    
    await prisma.dispute.create({
      data: {
        userId: user.id,
        type: disputeTypes[Math.floor(Math.random() * disputeTypes.length)],
        description: `Mô tả dispute ${i + 1}`,
        evidence: [],
        status: i < 10 ? 'PENDING' : 'IN_REVIEW',
      },
    });
  }

  console.log('');
  console.log('✅ Seed completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   🏢 ${operators.length} Tour Operators (operator1-8@lunavia.vn)`);
  console.log(`   🏬 ${agencies.length} Tour Agencies (agency1-5@lunavia.vn)`);
  console.log(`   🧑‍🏫 ${guides.length} Tour Guides (guide1-25@lunavia.vn)`);
  console.log('');
  console.log('   👑 Internal Staff:');
  console.log('      • admin@lunavia.vn (SUPER_ADMIN)');
  console.log('      • ops1-2@lunavia.vn (OPS_CS)');
  console.log('      • moderator1-3@lunavia.vn (MODERATOR)');
  console.log('      • finance1-2@lunavia.vn (FINANCE)');
  console.log('      • finance-lead@lunavia.vn (FINANCE_LEAD)');
  console.log('      • support1-5@lunavia.vn (SUPPORT_STAFF)');
  console.log('');
  console.log('   🔑 All passwords: Lunavia@123');
  console.log('   📈 20 Disputes (sample data)');
  console.log('');
  console.log('⚠️  Note: Tours should be created by operators through the application.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
