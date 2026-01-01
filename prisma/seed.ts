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

  // Seed Cities
  console.log('📍 Seeding cities...');
  const cities = [
    { name: 'Hà Nội', region: 'Miền Bắc', code: 'HAN' },
    { name: 'TP. Hồ Chí Minh', region: 'Miền Nam', code: 'SGN' },
    { name: 'Đà Nẵng', region: 'Miền Trung', code: 'DAD' },
    { name: 'Hội An', region: 'Miền Trung', code: 'HOA' },
    { name: 'Đà Lạt', region: 'Miền Nam', code: 'DLI' },
    { name: 'Nha Trang', region: 'Miền Trung', code: 'NHA' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
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
    const hashedPassword = await bcrypt.hash('password123', 10);
    const operator = await prisma.user.upsert({
      where: { email: `operator${i}@lunavia.com` },
      update: {},
      create: {
        email: `operator${i}@lunavia.com`,
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
            lockedDeposit: 1000000,
            reserved: 0,
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
        email: `company${i}@lunavia.com`,
        website: `https://company${i}.lunavia.com`,
        address: `${i} Đường ABC, Quận XYZ, TP. Hồ Chí Minh`,
        businessLicenseNumber: `BL${String(i).padStart(6, '0')}`,
        travelLicenseNumber: `TL${String(i).padStart(6, '0')}`,
      },
    });
  }

  // Create 5 Tour Agencies
  const agencies = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const agency = await prisma.user.upsert({
      where: { email: `agency${i}@lunavia.com` },
      update: {},
      create: {
        email: `agency${i}@lunavia.com`,
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
            lockedDeposit: 1000000,
            reserved: 0,
          },
        },
      },
    });
    agencies.push(agency);
  }

  // Create 25 Tour Guides
  const guides = [];
  for (let i = 1; i <= 25; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const guide = await prisma.user.upsert({
      where: { email: `guide${i}@lunavia.com` },
      update: {},
      create: {
        email: `guide${i}@lunavia.com`,
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
            lockedDeposit: 0,
            reserved: 0,
          },
        },
      },
    });
    guides.push(guide);
  }

  // Create Admin Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@lunavia.com' },
    update: {},
    create: {
      email: 'admin@lunavia.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      permissions: ['DISPUTES', 'TRANSFERS', 'PASSWORD_RESET', 'PROFILE_MGMT'],
    },
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.adminUser.upsert({
      where: { email: `moderator${i}@lunavia.com` },
      update: {},
      create: {
        email: `moderator${i}@lunavia.com`,
        password: adminPassword,
        role: 'MODERATOR',
        permissions: ['DISPUTES', 'TRANSFERS'],
      },
    });
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.adminUser.upsert({
      where: { email: `support${i}@lunavia.com` },
      update: {},
      create: {
        email: `support${i}@lunavia.com`,
        password: adminPassword,
        role: 'SUPPORT_STAFF',
        permissions: ['PASSWORD_RESET', 'PROFILE_MGMT'],
      },
    });
  }

  // Tours and Applications are not created in seed
  // They should be created by real operators through the application

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

  console.log('✅ Seed completed!');
  console.log(`   - ${operators.length} Tour Operators`);
  console.log(`   - ${agencies.length} Tour Agencies`);
  console.log(`   - ${guides.length} Tour Guides`);
  console.log(`   - 20 Disputes`);
  console.log('\n⚠️  Note: Tours and Applications should be created by real users through the application.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

