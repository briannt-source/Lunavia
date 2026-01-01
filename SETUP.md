# 🚀 LUNAVIA Setup Guide

Quick setup guide to get LUNAVIA running locally.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Run dev server
npm run dev
```

Visit http://localhost:3000

## Environment Variables Required

### Minimum Required

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lunavia"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional (for full functionality)

```env
LUNAVIA_API_KEY="sk-lunavia-your-key"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FIREBASE_PROJECT_ID="..."
RESEND_API_KEY="..."
```

## Database Setup

### Using PostgreSQL

1. Create database:
```sql
CREATE DATABASE lunavia;
```

2. Update DATABASE_URL in `.env.local`

3. Run migrations:
```bash
npm run db:migrate
```

4. Seed data:
```bash
npm run db:seed
```

## Test Accounts

After seeding, use these accounts:

**Operator:**
- Email: `operator1@lunavia.com`
- Password: `password123`

**Guide:**
- Email: `guide1@lunavia.com`
- Password: `password123`

**Admin:**
- Email: `admin@lunavia.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── domain/          # Business logic (Clean Architecture)
├── infrastructure/  # External services
├── lib/             # Utilities & configs
└── types/           # TypeScript types

prisma/
├── schema.prisma    # Database schema
└── seed.ts         # Seed script
```

## Key Features Implemented

✅ Authentication (NextAuth)
✅ Role-based access control
✅ Wallet system (1M/500k enforcement)
✅ Tour marketplace
✅ Tour creation (Operator/Agency only)
✅ Application system (Guide apply to tours)
✅ Admin dashboard
✅ AI matching service (Lunavia)
✅ Legal compliance checks

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database
npm run db:studio   # Open Prisma Studio
npm run db:migrate  # Run migrations
```

## Troubleshooting

### Database connection error
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify database exists

### Authentication errors
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your app URL

### Build errors
- Run `npm run db:generate` after schema changes
- Clear `.next` folder and rebuild

## Next Steps

1. Configure Firebase for document storage (KYC)
2. Set up Lunavia AI API key for matching
3. Configure email service (Resend) for notifications
4. Set up production database
5. Configure domain and SSL

