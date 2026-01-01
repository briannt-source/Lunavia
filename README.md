# 🚀 LUNAVIA - AI-powered Legal Tour Marketplace

**LUNAVIA** là nền tảng B2B kết nối Tour Operator & HDV tuân thủ 100% Luật Du lịch Việt Nam 2025.

## ✨ Features

- ⚖️ **100% Tuân thủ Pháp luật**: Chỉ Tour Operator/Agency được tạo tour, HDV chỉ apply
- 💰 **Wallet System**: Operator 1M deposit, Guide 500k minimum balance
- 🤖 **Lunavia AI**: Matching 92% accuracy, itinerary generation, AI chat
- 👥 **Role-based Access**: TOUR_OPERATOR, TOUR_AGENCY, TOUR_GUIDE, ADMIN roles
- 📊 **Full Admin System**: Dispute management, verification, transfers
- 💬 **Real-time Chat**: Socket.io powered communication
- 📱 **PWA Ready**: Progressive Web App support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Storage**: Firebase (KYC documents)
- **AI**: Lunavia AI Service

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🚀 Setup Instructions

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
- `LUNAVIA_API_KEY`: Your Lunavia AI API key (get at https://lunavia.ai)
- Firebase credentials (for document storage)
- Optional: Google OAuth credentials

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Test Accounts

After seeding, you can login with:

**Operators:**
- Email: `operator1@lunavia.com`
- Password: `password123`

**Agencies:**
- Email: `agency1@lunavia.com`
- Password: `password123`

**Guides:**
- Email: `guide1@lunavia.com`
- Password: `password123`

**Admin:**
- Email: `admin@lunavia.com`
- Password: `admin123`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   ├── tours/             # Tour marketplace
│   └── ai/                # AI features
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── domain/               # Domain layer (Clean Architecture)
│   └── services/         # Business logic services
├── infrastructure/       # Infrastructure layer
│   └── ai/              # External service integrations
├── lib/                 # Shared utilities
└── types/               # TypeScript type definitions

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Seed script
```

## ⚖️ Legal Requirements

### Tour Operator/Agency
- ✅ Must have business license number
- ✅ Minimum 1,000,000 VND locked deposit
- ✅ Account must be verified (APPROVED status)
- ✅ Only role that can create tours

### Tour Guide (HDV)
- ✅ Must have guide certificate
- ✅ Minimum 500,000 VND balance to apply
- ✅ Account must be verified (APPROVED status)
- ✅ Can only apply to tours, cannot create

## 🎯 Key Routes

- `/` - Landing page
- `/auth/signin` - Sign in page
- `/dashboard/operator` - Operator dashboard
- `/dashboard/guide` - Guide dashboard
- `/dashboard/admin` - Admin dashboard
- `/tours` - Tour marketplace
- `/tours/create` - Create new tour (Operator/Agency only)
- `/ai/match` - AI-powered guide matching
- `/chat/[tourId]` - Real-time chat

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

## 🤖 Lunavia AI Features

- **Guide Matching**: 92% accuracy matching guides to tours
- **Itinerary Generation**: AI-powered tour itinerary creation
- **Chat Assistant**: AI chat support
- **Analytics**: Insights and recommendations

## 🔐 Security

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control (RBAC)
- Middleware route protection
- Input validation with Zod

## 📄 License

Private - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.

---

**LUNAVIA** - Kết nối thông minh Tour Operator & HDV ⚖️🤖🚀

