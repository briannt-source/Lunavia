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

  // Seed Cities — expanded to cover major tourist provinces
  console.log('📍 Seeding cities...');
  const cities = [
    { name: 'Hà Nội', region: 'Miền Bắc', code: 'HAN', country: 'VN' },
    { name: 'TP. Hồ Chí Minh', region: 'Miền Nam', code: 'SGN', country: 'VN' },
    { name: 'Đà Nẵng', region: 'Miền Trung', code: 'DAD', country: 'VN' },
    { name: 'Hội An', region: 'Miền Trung', code: 'HOA', country: 'VN' },
    { name: 'Đà Lạt', region: 'Miền Nam', code: 'DLI', country: 'VN' },
    { name: 'Nha Trang', region: 'Miền Trung', code: 'NHA', country: 'VN' },
    { name: 'Huế', region: 'Miền Trung', code: 'HUE', country: 'VN' },
    { name: 'Phú Quốc', region: 'Miền Nam', code: 'PQC', country: 'VN' },
    { name: 'Sa Pa', region: 'Miền Bắc', code: 'SPA', country: 'VN' },
    { name: 'Hạ Long', region: 'Miền Bắc', code: 'HLG', country: 'VN' },
    { name: 'Cần Thơ', region: 'Miền Nam', code: 'VCA', country: 'VN' },
    { name: 'Quy Nhơn', region: 'Miền Trung', code: 'UIH', country: 'VN' },
    { name: 'Vũng Tàu', region: 'Miền Nam', code: 'VTU', country: 'VN' },
    { name: 'Ninh Bình', region: 'Miền Bắc', code: 'NBH', country: 'VN' },
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

  // Guide profile data for realistic diversity
  const guideProfiles = [
    { name: 'Nguyễn Văn An', bio: 'HDV chuyên Inbound Nhật, 8 năm kinh nghiệm tại Hà Nội & Sapa.', phone: '0901234501', address: 'Hà Nội', languages: ['Tiếng Việt', 'English', '日本語'], specialties: ['Văn hóa', 'Lịch sử'] },
    { name: 'Trần Thị Bình', bio: 'Chuyên dẫn đoàn Pháp, thông thạo lịch sử Huế.', phone: '0901234502', address: 'Huế', languages: ['Tiếng Việt', 'English', 'Français'], specialties: ['Lịch sử', 'Văn hóa'] },
    { name: 'Lê Minh Châu', bio: 'Tour ẩm thực đường phố Sài Gòn, xuyên Chợ Lớn.', phone: '0901234503', address: 'TP. Hồ Chí Minh', languages: ['Tiếng Việt', 'English', '中文'], specialties: ['Ẩm thực'] },
    { name: 'Phạm Đức Dũng', bio: 'Trekking Sa Pa, homestay Tây Bắc.', phone: '0901234504', address: 'Sa Pa', languages: ['Tiếng Việt', 'English'], specialties: ['Mạo hiểm', 'Sinh thái'] },
    { name: 'Hoàng Thị Hoa', bio: 'Tour city Đà Nẵng & Hội An, chuyên khách Hàn Quốc.', phone: '0901234505', address: 'Đà Nẵng', languages: ['Tiếng Việt', 'English', '한국어'], specialties: ['City Tour', 'Văn hóa'] },
    { name: 'Võ Quốc Khánh', bio: 'Hướng dẫn viên Phú Quốc, lặn biển & đảo.', phone: '0901234506', address: 'Phú Quốc', languages: ['Tiếng Việt', 'English'], specialties: ['Sinh thái', 'Mạo hiểm'] },
    { name: 'Đặng Thị Lan', bio: 'Tour di sản thế giới Ninh Bình – Tràng An.', phone: '0901234507', address: 'Ninh Bình', languages: ['Tiếng Việt', 'English', 'Français'], specialties: ['Lịch sử', 'Sinh thái'] },
    { name: 'Bùi Hữu Long', bio: 'Vịnh Hạ Long – chuyên du thuyền & kayak.', phone: '0901234508', address: 'Hạ Long', languages: ['Tiếng Việt', 'English'], specialties: ['Mạo hiểm', 'Sinh thái'] },
    { name: 'Ngô Thanh Mai', bio: 'Tour ẩm thực Hà Nội phố cổ, 5 năm kinh nghiệm.', phone: '0901234509', address: 'Hà Nội', languages: ['Tiếng Việt', 'English', '中文'], specialties: ['Ẩm thực', 'City Tour'] },
    { name: 'Trịnh Văn Nam', bio: 'Tour cao nguyên Đà Lạt, xe máy & cà phê.', phone: '0901234510', address: 'Đà Lạt', languages: ['Tiếng Việt', 'English'], specialties: ['Mạo hiểm', 'Ẩm thực'] },
    { name: 'Lý Thị Oanh', bio: 'Chuyên tour biển Nha Trang, snorkeling.', phone: '0901234511', address: 'Nha Trang', languages: ['Tiếng Việt', 'English', 'Русский'], specialties: ['Sinh thái', 'City Tour'] },
    { name: 'Phan Quốc Phong', bio: 'Miền Tây sông nước – chợ nổi Cần Thơ.', phone: '0901234512', address: 'Cần Thơ', languages: ['Tiếng Việt', 'English'], specialties: ['Văn hóa', 'Sinh thái'] },
    { name: 'Hồ Thị Quỳnh', bio: 'Tour Quy Nhơn – Phú Yên, biển hoang sơ.', phone: '0901234513', address: 'Quy Nhơn', languages: ['Tiếng Việt', 'English'], specialties: ['Sinh thái', 'City Tour'] },
    { name: 'Đỗ Minh Sơn', bio: 'Chuyên dẫn đoàn Trung Quốc tại TP.HCM.', phone: '0901234514', address: 'TP. Hồ Chí Minh', languages: ['Tiếng Việt', '中文', 'English'], specialties: ['City Tour', 'Ẩm thực'] },
    { name: 'Vũ Thị Trang', bio: 'Tour lịch sử cố đô Huế, kiến trúc cung đình.', phone: '0901234515', address: 'Huế', languages: ['Tiếng Việt', 'English', 'Français'], specialties: ['Lịch sử', 'Văn hóa'] },
    { name: 'Mai Xuân Uy', bio: 'Tour Vũng Tàu cuối tuần, teambuilding.', phone: '0901234516', address: 'Vũng Tàu', languages: ['Tiếng Việt', 'English'], specialties: ['City Tour', 'Mạo hiểm'] },
    { name: 'Cao Thị Vân', bio: 'Tour Sài Gòn by night, rooftop & xe vespa.', phone: '0901234517', address: 'TP. Hồ Chí Minh', languages: ['Tiếng Việt', 'English', '한국어'], specialties: ['City Tour', 'Ẩm thực'] },
    { name: 'Lưu Đình Vinh', bio: 'Hành trình xe máy Hà Giang & Đông Bắc.', phone: '0901234518', address: 'Hà Nội', languages: ['Tiếng Việt', 'English'], specialties: ['Mạo hiểm', 'Sinh thái'] },
    { name: 'Nguyễn Thị Yến', bio: 'Tour shopping & spa Hội An, thông thạo tiếng Anh.', phone: '0901234519', address: 'Hội An', languages: ['Tiếng Việt', 'English', '日本語'], specialties: ['City Tour', 'Văn hóa'] },
    { name: 'Trần Công Bảo', bio: 'Chuyên Outbound Thái Lan, 6 năm kinh nghiệm.', phone: '0901234520', address: 'TP. Hồ Chí Minh', languages: ['Tiếng Việt', 'English', 'ภาษาไทย'], specialties: ['Outbound', 'City Tour'] },
    { name: 'Lê Phương Anh', bio: 'Tour văn hóa Đà Nẵng, Bà Nà Hills chuyên sâu.', phone: '0901234521', address: 'Đà Nẵng', languages: ['Tiếng Việt', 'English', '中文'], specialties: ['Văn hóa', 'City Tour'] },
    { name: 'Phạm Hải Đăng', bio: 'Tour phượt Đà Lạt – Nha Trang, 4 năm kinh nghiệm.', phone: '0901234522', address: 'Đà Lạt', languages: ['Tiếng Việt', 'English'], specialties: ['Mạo hiểm', 'Sinh thái'] },
    { name: 'Hoàng Thị Giang', bio: 'Tour cộng đồng Sapa, H\'Mông homestay.', phone: '0901234523', address: 'Sa Pa', languages: ['Tiếng Việt', 'English', 'Français'], specialties: ['Văn hóa', 'Sinh thái'] },
    { name: 'Vương Minh Hiếu', bio: 'Tour miền Tây sông nước & du lịch nông nghiệp.', phone: '0901234524', address: 'Cần Thơ', languages: ['Tiếng Việt', 'English'], specialties: ['Sinh thái', 'Văn hóa'] },
    { name: 'Đặng Thanh Hương', bio: 'Tour lặn biển Phú Quốc, hướng dẫn PADI.', phone: '0901234525', address: 'Phú Quốc', languages: ['Tiếng Việt', 'English', 'Deutsch'], specialties: ['Mạo hiểm', 'Sinh thái'] },
  ];

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

  // Create 25 Tour Guides with realistic Vietnamese profiles
  console.log('🧑‍🏫 Seeding tour guides with realistic profiles...');
  const guides = [];
  for (let i = 1; i <= 25; i++) {
    const profile = guideProfiles[i - 1];
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
            name: profile.name,
            bio: profile.bio,
            phone: profile.phone,
            address: profile.address,
            languages: profile.languages,
            experienceYears: Math.floor(Math.random() * 10) + 1,
            specialties: profile.specialties,
            rating: 4.0 + Math.random() * 1.0,
            reviewCount: Math.floor(Math.random() * 50) + 5,
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

  // ============================================================
  // Create Sample Tours — diverse provinces, types, and statuses
  // ============================================================
  console.log('🗺️  Seeding sample tours...');

  const now = new Date();
  const day = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date;
  };

  const sampleTours = [
    // OPEN tours — Guides can apply
    { op: 0, title: 'Khám phá Phố cổ Hà Nội', city: 'Hà Nội', province: 'HAN', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 8, price: 800000,  lang: ['English', 'Tiếng Việt'], specs: ['Văn hóa', 'City Tour'], hours: 4, start: day(3) },
    { op: 0, title: 'Vịnh Hạ Long 2 ngày 1 đêm', city: 'Hạ Long', province: 'HLG', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 15, price: 2500000, lang: ['English', 'Tiếng Việt'], specs: ['Sinh thái', 'Mạo hiểm'], hours: 48, start: day(5) },
    { op: 1, title: 'Hội An Lantern Night Walk', city: 'Hội An', province: 'HOA', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 10, price: 600000,  lang: ['English', 'Tiếng Việt', '中文'], specs: ['Văn hóa', 'City Tour'], hours: 3, start: day(4) },
    { op: 1, title: 'Tour Cố đô Huế trọn ngày', city: 'Huế', province: 'HUE', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 12, price: 1200000, lang: ['English', 'Tiếng Việt', 'Français'], specs: ['Lịch sử', 'Văn hóa'], hours: 8, start: day(7) },
    { op: 2, title: 'Đà Nẵng – Bà Nà Hills VIP', city: 'Đà Nẵng', province: 'DAD', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 20, price: 1800000, lang: ['English', 'Tiếng Việt', '한국어'], specs: ['City Tour', 'Mạo hiểm'], hours: 10, start: day(6) },
    { op: 2, title: 'Tour ẩm thực đường phố Sài Gòn', city: 'TP. Hồ Chí Minh', province: 'SGN', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 6, price: 500000, lang: ['English', 'Tiếng Việt'], specs: ['Ẩm thực'], hours: 4, start: day(2) },
    { op: 3, title: 'Trekking Sa Pa – Bản Cát Cát', city: 'Sa Pa', province: 'SPA', market: 'INBOUND' as const,  status: 'OPEN' as const, pax: 8, price: 1500000, lang: ['English', 'Tiếng Việt'], specs: ['Mạo hiểm', 'Sinh thái'], hours: 24, start: day(10) },
    { op: 3, title: 'Tour du lịch Outbound Bangkok', city: 'Bangkok', province: null, market: 'OUTBOUND' as const, status: 'OPEN' as const, pax: 25, price: 5000000, lang: ['Tiếng Việt', 'English'], specs: ['City Tour', 'Ẩm thực'], hours: 72, start: day(14) },

    // IN_PROGRESS tours — currently running
    { op: 4, title: 'Đà Lạt – Thung lũng Tình Yêu', city: 'Đà Lạt', province: 'DLI', market: 'INBOUND' as const,  status: 'IN_PROGRESS' as const, pax: 10, price: 900000, lang: ['English', 'Tiếng Việt'], specs: ['Sinh thái', 'City Tour'], hours: 8, start: day(-1) },
    { op: 4, title: 'Nha Trang Snorkeling & Island', city: 'Nha Trang', province: 'NHA', market: 'INBOUND' as const,  status: 'IN_PROGRESS' as const, pax: 12, price: 1100000, lang: ['English', 'Tiếng Việt', 'Русский'], specs: ['Mạo hiểm', 'Sinh thái'], hours: 8, start: day(0) },

    // COMPLETED tours — for history/reporting
    { op: 5, title: 'Chợ nổi Cần Thơ buổi sáng', city: 'Cần Thơ', province: 'VCA', market: 'INBOUND' as const,  status: 'COMPLETED' as const, pax: 6, price: 700000, lang: ['English', 'Tiếng Việt'], specs: ['Văn hóa', 'Sinh thái'], hours: 5, start: day(-7) },
    { op: 5, title: 'Ninh Bình – Tràng An UNESCO', city: 'Ninh Bình', province: 'NBH', market: 'INBOUND' as const,  status: 'COMPLETED' as const, pax: 8, price: 950000, lang: ['English', 'Tiếng Việt', 'Français'], specs: ['Lịch sử', 'Sinh thái'], hours: 10, start: day(-10) },
    { op: 6, title: 'Phú Quốc Sunset & Câu mực', city: 'Phú Quốc', province: 'PQC', market: 'INBOUND' as const,  status: 'COMPLETED' as const, pax: 10, price: 1300000, lang: ['English', 'Tiếng Việt'], specs: ['Sinh thái', 'Ẩm thực'], hours: 6, start: day(-5) },
    { op: 6, title: 'Quy Nhơn Eo Gió Discovery', city: 'Quy Nhơn', province: 'UIH', market: 'INBOUND' as const,  status: 'COMPLETED' as const, pax: 5, price: 600000, lang: ['English', 'Tiếng Việt'], specs: ['Sinh thái', 'City Tour'], hours: 8, start: day(-14) },

    // DRAFT tours — not published yet
    { op: 7, title: 'Vũng Tàu Weekend Beach Party', city: 'Vũng Tàu', province: 'VTU', market: 'INBOUND' as const,  status: 'DRAFT' as const, pax: 30, price: 400000, lang: ['Tiếng Việt', 'English'], specs: ['City Tour', 'Mạo hiểm'], hours: 12, start: day(21) },
    { op: 7, title: 'Tour Outbound Seoul – Hàn Quốc', city: 'Seoul', province: null, market: 'OUTBOUND' as const, status: 'DRAFT' as const, pax: 20, price: 8000000, lang: ['Tiếng Việt', '한국어'], specs: ['City Tour', 'Văn hóa'], hours: 96, start: day(30) },

    // CANCELLED tour
    { op: 0, title: 'Sài Gòn Night Tour (Cancelled)', city: 'TP. Hồ Chí Minh', province: 'SGN', market: 'INBOUND' as const, status: 'CANCELLED' as const, pax: 8, price: 500000, lang: ['English', 'Tiếng Việt'], specs: ['City Tour', 'Ẩm thực'], hours: 4, start: day(-3) },

    // Additional OPEN tours for marketplace density
    { op: 4, title: 'Hà Nội – Tam Cốc Full Day', city: 'Hà Nội', province: 'HAN', market: 'INBOUND' as const, status: 'OPEN' as const, pax: 14, price: 1400000, lang: ['English', 'Tiếng Việt', '日本語'], specs: ['Lịch sử', 'Sinh thái'], hours: 12, start: day(8) },
    { op: 5, title: 'Sài Gòn Vespa Food Tour', city: 'TP. Hồ Chí Minh', province: 'SGN', market: 'INBOUND' as const, status: 'OPEN' as const, pax: 4, price: 750000, lang: ['English', 'Tiếng Việt'], specs: ['Ẩm thực', 'City Tour'], hours: 4, start: day(3) },
    { op: 6, title: 'Đà Lạt Canyoning Adventure', city: 'Đà Lạt', province: 'DLI', market: 'INBOUND' as const, status: 'OPEN' as const, pax: 8, price: 2000000, lang: ['English', 'Tiếng Việt'], specs: ['Mạo hiểm'], hours: 8, start: day(9) },
    { op: 7, title: 'Tour Outbound Nhật Bản – Osaka', city: 'Osaka', province: null, market: 'OUTBOUND' as const, status: 'OPEN' as const, pax: 18, price: 12000000, lang: ['Tiếng Việt', '日本語', 'English'], specs: ['Văn hóa', 'Ẩm thực'], hours: 120, start: day(20) },
    { op: 3, title: 'Tour Outbound Singapore Shopping', city: 'Singapore', province: null, market: 'OUTBOUND' as const, status: 'OPEN' as const, pax: 15, price: 6000000, lang: ['Tiếng Việt', 'English'], specs: ['City Tour'], hours: 48, start: day(15) },
    { op: 1, title: 'Huế – Đại Nội & Lăng Tẩm', city: 'Huế', province: 'HUE', market: 'INBOUND' as const, status: 'OPEN' as const, pax: 10, price: 1000000, lang: ['English', 'Tiếng Việt'], specs: ['Lịch sử', 'Văn hóa'], hours: 8, start: day(11) },
  ];

  const createdTours = [];
  for (const t of sampleTours) {
    const endDate = new Date(t.start);
    endDate.setHours(endDate.getHours() + t.hours);

    const tour = await prisma.tour.create({
      data: {
        operatorId: operators[t.op].id,
        title: t.title,
        description: `Tour: ${t.title}. Đoàn ${t.pax} khách, thời lượng ${t.hours}h.`,
        city: t.city,
        province: t.province,
        marketType: t.market,
        status: t.status,
        pax: t.pax,
        priceMain: t.price,
        priceSub: Math.round(t.price * 0.6),
        languages: t.lang,
        specialties: t.specs,
        startDate: t.start,
        endDate,
        durationHours: t.hours,
        itinerary: [],
      },
    });
    createdTours.push(tour);
  }

  // Create sample applications for OPEN tours
  console.log('📝 Seeding sample applications...');
  const openTours = createdTours.filter(t => sampleTours[createdTours.indexOf(t)]?.status === 'OPEN');
  let appCount = 0;
  for (const tour of openTours.slice(0, 10)) {
    // 2-4 guides apply per open tour
    const numApplicants = 2 + Math.floor(Math.random() * 3);
    const applicantIndices = new Set<number>();
    while (applicantIndices.size < Math.min(numApplicants, guides.length)) {
      applicantIndices.add(Math.floor(Math.random() * guides.length));
    }
    for (const idx of applicantIndices) {
      try {
        await prisma.application.create({
          data: {
            tourId: tour.id,
            guideId: guides[idx].id,
            role: 'MAIN',
            status: 'PENDING',
            coverLetter: `Tôi muốn ứng tuyển dẫn tour "${sampleTours[createdTours.indexOf(tour)]?.title}". Tôi có kinh nghiệm phù hợp.`,
          },
        });
        appCount++;
      } catch {
        // Ignore duplicate application errors
      }
    }
  }

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
  console.log(`   🧑‍🏫 ${guides.length} Tour Guides (guide1-25@lunavia.vn) — realistic VN profiles`);
  console.log(`   📍 ${cities.length} Cities seeded`);
  console.log(`   🗺️  ${createdTours.length} Tours (OPEN/IN_PROGRESS/COMPLETED/DRAFT/CANCELLED)`);
  console.log(`   📝 ${appCount} Applications (guides → open tours)`);
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
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
