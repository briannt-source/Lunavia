/**
 * Seed Location Data — Market-based location hierarchy
 * 
 * INBOUND: Vietnamese provinces grouped by region
 * OUTBOUND: International destinations (countries + major cities)
 */

export interface SeedCity {
    name: string;
    nameLocal?: string;
    region: string;
    code: string;
    country: string;
}

// ══════════════════════════════════════════════════════════════════════
// VIETNAM PROVINCES (INBOUND)
// ══════════════════════════════════════════════════════════════════════

export const VN_PROVINCES: SeedCity[] = [
    // Miền Bắc (North)
    { name: 'Ha Noi', nameLocal: 'Hà Nội', region: 'Miền Bắc', code: 'HN', country: 'VN' },
    { name: 'Hai Phong', nameLocal: 'Hải Phòng', region: 'Miền Bắc', code: 'HP', country: 'VN' },
    { name: 'Quang Ninh', nameLocal: 'Quảng Ninh', region: 'Miền Bắc', code: 'QN', country: 'VN' },
    { name: 'Lao Cai', nameLocal: 'Lào Cai (Sapa)', region: 'Miền Bắc', code: 'LC', country: 'VN' },
    { name: 'Ninh Binh', nameLocal: 'Ninh Bình', region: 'Miền Bắc', code: 'NB', country: 'VN' },
    { name: 'Ha Giang', nameLocal: 'Hà Giang', region: 'Miền Bắc', code: 'HG', country: 'VN' },
    { name: 'Cao Bang', nameLocal: 'Cao Bằng', region: 'Miền Bắc', code: 'CB', country: 'VN' },
    { name: 'Thai Nguyen', nameLocal: 'Thái Nguyên', region: 'Miền Bắc', code: 'TN', country: 'VN' },
    { name: 'Hoa Binh', nameLocal: 'Hoà Bình', region: 'Miền Bắc', code: 'HB', country: 'VN' },
    { name: 'Son La', nameLocal: 'Sơn La', region: 'Miền Bắc', code: 'SL', country: 'VN' },
    { name: 'Dien Bien', nameLocal: 'Điện Biên', region: 'Miền Bắc', code: 'DB', country: 'VN' },
    { name: 'Hai Duong', nameLocal: 'Hải Dương', region: 'Miền Bắc', code: 'HD', country: 'VN' },
    { name: 'Bac Ninh', nameLocal: 'Bắc Ninh', region: 'Miền Bắc', code: 'BN', country: 'VN' },

    // Miền Trung (Central)
    { name: 'Da Nang', nameLocal: 'Đà Nẵng', region: 'Miền Trung', code: 'DN', country: 'VN' },
    { name: 'Thua Thien Hue', nameLocal: 'Thừa Thiên Huế', region: 'Miền Trung', code: 'TTH', country: 'VN' },
    { name: 'Quang Nam', nameLocal: 'Quảng Nam (Hội An)', region: 'Miền Trung', code: 'QNA', country: 'VN' },
    { name: 'Khanh Hoa', nameLocal: 'Khánh Hoà (Nha Trang)', region: 'Miền Trung', code: 'KH', country: 'VN' },
    { name: 'Binh Dinh', nameLocal: 'Bình Định (Quy Nhơn)', region: 'Miền Trung', code: 'BD', country: 'VN' },
    { name: 'Phu Yen', nameLocal: 'Phú Yên', region: 'Miền Trung', code: 'PY', country: 'VN' },
    { name: 'Quang Binh', nameLocal: 'Quảng Bình', region: 'Miền Trung', code: 'QB', country: 'VN' },
    { name: 'Quang Tri', nameLocal: 'Quảng Trị', region: 'Miền Trung', code: 'QT', country: 'VN' },
    { name: 'Nghe An', nameLocal: 'Nghệ An', region: 'Miền Trung', code: 'NA', country: 'VN' },
    { name: 'Ha Tinh', nameLocal: 'Hà Tĩnh', region: 'Miền Trung', code: 'HT', country: 'VN' },
    { name: 'Ninh Thuan', nameLocal: 'Ninh Thuận', region: 'Miền Trung', code: 'NT', country: 'VN' },
    { name: 'Binh Thuan', nameLocal: 'Bình Thuận (Phan Thiết)', region: 'Miền Trung', code: 'BTN', country: 'VN' },

    // Tây Nguyên (Central Highlands)
    { name: 'Lam Dong', nameLocal: 'Lâm Đồng (Đà Lạt)', region: 'Tây Nguyên', code: 'LD', country: 'VN' },
    { name: 'Dak Lak', nameLocal: 'Đắk Lắk', region: 'Tây Nguyên', code: 'DL', country: 'VN' },
    { name: 'Gia Lai', nameLocal: 'Gia Lai', region: 'Tây Nguyên', code: 'GL', country: 'VN' },
    { name: 'Kon Tum', nameLocal: 'Kon Tum', region: 'Tây Nguyên', code: 'KT', country: 'VN' },
    { name: 'Dak Nong', nameLocal: 'Đắk Nông', region: 'Tây Nguyên', code: 'DNo', country: 'VN' },

    // Miền Nam (South)
    { name: 'Ho Chi Minh City', nameLocal: 'TP. Hồ Chí Minh', region: 'Miền Nam', code: 'HCM', country: 'VN' },
    { name: 'Ba Ria - Vung Tau', nameLocal: 'Bà Rịa - Vũng Tàu', region: 'Miền Nam', code: 'VT', country: 'VN' },
    { name: 'Kien Giang', nameLocal: 'Kiên Giang (Phú Quốc)', region: 'Miền Nam', code: 'KG', country: 'VN' },
    { name: 'Can Tho', nameLocal: 'Cần Thơ', region: 'Miền Nam', code: 'CT', country: 'VN' },
    { name: 'Binh Duong', nameLocal: 'Bình Dương', region: 'Miền Nam', code: 'BDG', country: 'VN' },
    { name: 'Dong Nai', nameLocal: 'Đồng Nai', region: 'Miền Nam', code: 'DNI', country: 'VN' },
    { name: 'Long An', nameLocal: 'Long An', region: 'Miền Nam', code: 'LA', country: 'VN' },
    { name: 'Tien Giang', nameLocal: 'Tiền Giang', region: 'Miền Nam', code: 'TG', country: 'VN' },
    { name: 'Ben Tre', nameLocal: 'Bến Tre', region: 'Miền Nam', code: 'BT', country: 'VN' },
    { name: 'An Giang', nameLocal: 'An Giang', region: 'Miền Nam', code: 'AG', country: 'VN' },
    { name: 'Tay Ninh', nameLocal: 'Tây Ninh', region: 'Miền Nam', code: 'TNI', country: 'VN' },
];

// ══════════════════════════════════════════════════════════════════════
// OUTBOUND DESTINATIONS
// ══════════════════════════════════════════════════════════════════════

export const OUTBOUND_CITIES: SeedCity[] = [
    // 🇨🇳 China
    { name: 'Beijing', nameLocal: '北京', region: 'North China', code: 'BJ', country: 'CN' },
    { name: 'Shanghai', nameLocal: '上海', region: 'East China', code: 'SH', country: 'CN' },
    { name: 'Guangzhou', nameLocal: '广州', region: 'South China', code: 'GZ', country: 'CN' },
    { name: 'Kunming', nameLocal: '昆明', region: 'Southwest China', code: 'KM', country: 'CN' },
    { name: 'Nanning', nameLocal: '南宁', region: 'South China', code: 'NN', country: 'CN' },
    { name: 'Shenzhen', nameLocal: '深圳', region: 'South China', code: 'SZ', country: 'CN' },
    { name: 'Chengdu', nameLocal: '成都', region: 'Southwest China', code: 'CD', country: 'CN' },
    { name: 'Hangzhou', nameLocal: '杭州', region: 'East China', code: 'HZ', country: 'CN' },

    // 🇰🇷 South Korea
    { name: 'Seoul', nameLocal: '서울', region: 'Capital Area', code: 'SEL', country: 'KR' },
    { name: 'Busan', nameLocal: '부산', region: 'Southeast', code: 'BSN', country: 'KR' },
    { name: 'Jeju', nameLocal: '제주', region: 'Jeju Island', code: 'CJU', country: 'KR' },
    { name: 'Incheon', nameLocal: '인천', region: 'Capital Area', code: 'ICN', country: 'KR' },
    { name: 'Gyeongju', nameLocal: '경주', region: 'Southeast', code: 'GJ', country: 'KR' },

    // 🇯🇵 Japan
    { name: 'Tokyo', nameLocal: '東京', region: 'Kanto', code: 'TYO', country: 'JP' },
    { name: 'Osaka', nameLocal: '大阪', region: 'Kansai', code: 'OSA', country: 'JP' },
    { name: 'Kyoto', nameLocal: '京都', region: 'Kansai', code: 'KYO', country: 'JP' },
    { name: 'Hokkaido', nameLocal: '北海道', region: 'Hokkaido', code: 'HKD', country: 'JP' },
    { name: 'Fukuoka', nameLocal: '福岡', region: 'Kyushu', code: 'FUK', country: 'JP' },
    { name: 'Okinawa', nameLocal: '沖縄', region: 'Okinawa', code: 'OKA', country: 'JP' },
    { name: 'Nagoya', nameLocal: '名古屋', region: 'Chubu', code: 'NGO', country: 'JP' },

    // 🇸🇬 Singapore
    { name: 'Singapore', nameLocal: 'Singapore', region: 'Singapore', code: 'SIN', country: 'SG' },

    // 🇲🇾 Malaysia
    { name: 'Kuala Lumpur', nameLocal: 'Kuala Lumpur', region: 'Peninsula', code: 'KUL', country: 'MY' },
    { name: 'Penang', nameLocal: 'Penang', region: 'Peninsula', code: 'PEN', country: 'MY' },
    { name: 'Langkawi', nameLocal: 'Langkawi', region: 'Peninsula', code: 'LGK', country: 'MY' },
    { name: 'Johor Bahru', nameLocal: 'Johor Bahru', region: 'Peninsula', code: 'JHB', country: 'MY' },
    { name: 'Kota Kinabalu', nameLocal: 'Kota Kinabalu', region: 'Borneo', code: 'BKI', country: 'MY' },

    // 🇹🇭 Thailand
    { name: 'Bangkok', nameLocal: 'กรุงเทพ', region: 'Central', code: 'BKK', country: 'TH' },
    { name: 'Phuket', nameLocal: 'ภูเก็ต', region: 'South', code: 'HKT', country: 'TH' },
    { name: 'Chiang Mai', nameLocal: 'เชียงใหม่', region: 'North', code: 'CNX', country: 'TH' },
    { name: 'Pattaya', nameLocal: 'พัทยา', region: 'Central', code: 'PYX', country: 'TH' },

    // 🇰🇭 Cambodia
    { name: 'Siem Reap', nameLocal: 'សៀមរាប', region: 'Northwest', code: 'REP', country: 'KH' },
    { name: 'Phnom Penh', nameLocal: 'ភ្នំពេញ', region: 'Central', code: 'PNH', country: 'KH' },

    // 🇪🇺 Europe (grouped as regions within "EU")
    { name: 'Paris', nameLocal: 'Paris', region: 'France', code: 'PAR', country: 'EU' },
    { name: 'Rome', nameLocal: 'Roma', region: 'Italy', code: 'ROM', country: 'EU' },
    { name: 'Barcelona', nameLocal: 'Barcelona', region: 'Spain', code: 'BCN', country: 'EU' },
    { name: 'Prague', nameLocal: 'Praha', region: 'Czech Republic', code: 'PRG', country: 'EU' },
    { name: 'Amsterdam', nameLocal: 'Amsterdam', region: 'Netherlands', code: 'AMS', country: 'EU' },
    { name: 'London', nameLocal: 'London', region: 'United Kingdom', code: 'LON', country: 'EU' },
    { name: 'Zurich', nameLocal: 'Zürich', region: 'Switzerland', code: 'ZRH', country: 'EU' },
    { name: 'Munich', nameLocal: 'München', region: 'Germany', code: 'MUC', country: 'EU' },
    { name: 'Vienna', nameLocal: 'Wien', region: 'Austria', code: 'VIE', country: 'EU' },

    // 🇺🇸 USA
    { name: 'New York', nameLocal: 'New York', region: 'East Coast', code: 'NYC', country: 'US' },
    { name: 'Los Angeles', nameLocal: 'Los Angeles', region: 'West Coast', code: 'LAX', country: 'US' },
    { name: 'San Francisco', nameLocal: 'San Francisco', region: 'West Coast', code: 'SFO', country: 'US' },
    { name: 'Las Vegas', nameLocal: 'Las Vegas', region: 'West', code: 'LAS', country: 'US' },
    { name: 'Washington DC', nameLocal: 'Washington DC', region: 'East Coast', code: 'WAS', country: 'US' },

    // 🇦🇺 Australia
    { name: 'Sydney', nameLocal: 'Sydney', region: 'New South Wales', code: 'SYD', country: 'AU' },
    { name: 'Melbourne', nameLocal: 'Melbourne', region: 'Victoria', code: 'MEL', country: 'AU' },
    { name: 'Gold Coast', nameLocal: 'Gold Coast', region: 'Queensland', code: 'OOL', country: 'AU' },
    { name: 'Brisbane', nameLocal: 'Brisbane', region: 'Queensland', code: 'BNE', country: 'AU' },
];

// ══════════════════════════════════════════════════════════════════════
// COUNTRIES REGISTRY
// ══════════════════════════════════════════════════════════════════════

export interface Country {
    code: string;
    name: string;
    nameLocal: string;
    flag: string;
    region: string;
}

export const SUPPORTED_COUNTRIES: Country[] = [
    { code: 'VN', name: 'Vietnam', nameLocal: 'Việt Nam', flag: '🇻🇳', region: 'Southeast Asia' },
    { code: 'CN', name: 'China', nameLocal: '中国', flag: '🇨🇳', region: 'East Asia' },
    { code: 'KR', name: 'South Korea', nameLocal: '대한민국', flag: '🇰🇷', region: 'East Asia' },
    { code: 'JP', name: 'Japan', nameLocal: '日本', flag: '🇯🇵', region: 'East Asia' },
    { code: 'SG', name: 'Singapore', nameLocal: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia' },
    { code: 'MY', name: 'Malaysia', nameLocal: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia' },
    { code: 'TH', name: 'Thailand', nameLocal: 'ประเทศไทย', flag: '🇹🇭', region: 'Southeast Asia' },
    { code: 'KH', name: 'Cambodia', nameLocal: 'កម្ពុជា', flag: '🇰🇭', region: 'Southeast Asia' },
    { code: 'EU', name: 'Europe', nameLocal: 'Europe', flag: '🇪🇺', region: 'Europe' },
    { code: 'US', name: 'United States', nameLocal: 'United States', flag: '🇺🇸', region: 'Americas' },
    { code: 'AU', name: 'Australia', nameLocal: 'Australia', flag: '🇦🇺', region: 'Oceania' },
];

// Outbound-only countries (exclude VN)
export const OUTBOUND_COUNTRIES = SUPPORTED_COUNTRIES.filter(c => c.code !== 'VN');

// All seed data combined
export const ALL_SEED_CITIES: SeedCity[] = [...VN_PROVINCES, ...OUTBOUND_CITIES];
