# 🚀 LUNAVIA - Hướng dẫn Deploy Production

## ✅ Tình trạng hiện tại

### Frontend ✅
- ✅ Tất cả UI/UX đã hoàn thiện
- ✅ 53 pages đã được convert từ Stitch
- ✅ Dashboard cho tất cả roles (Operator, Guide, Admin)
- ✅ Responsive design
- ✅ PWA ready

### Backend ✅
- ✅ Tất cả API endpoints đã implement
- ✅ Authentication & Authorization
- ✅ Database schema đầy đủ
- ✅ Business logic (Clean Architecture)
- ✅ AI Integration (Lunavia)
- ✅ Real-time features (Socket.io)

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

### 1. Environment Variables

Tạo file `.env.production` hoặc cấu hình trên hosting platform:

```env
# ============================================
# BẮT BUỘC
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/lunavia_prod"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-generate-with-openssl"
NEXTAUTH_URL="https://yourdomain.com"

# ============================================
# TÙY CHỌN (nhưng khuyến nghị)
# ============================================
# AI Service
LUNAVIA_API_KEY="sk-lunavia-your-production-key"

# Google OAuth (nếu dùng)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Firebase (cho document storage)
FIREBASE_PROJECT_ID="your-firebase-project"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_STORAGE_BUCKET="your-bucket-name"

# Email Service (Resend)
RESEND_API_KEY="re_your-resend-api-key"

# ============================================
# OPTIONAL
# ============================================
NODE_ENV="production"
```

**Cách tạo NEXTAUTH_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Database Setup

#### 2.1. Tạo Production Database

**Option A: PostgreSQL trên Cloud (Khuyến nghị)**
- **Vercel Postgres**: Tích hợp sẵn với Vercel
- **Supabase**: Free tier tốt, dễ setup
- **Neon**: Serverless PostgreSQL
- **AWS RDS**: Enterprise grade
- **DigitalOcean Managed Database**: Giá rẻ, ổn định

**Option B: Self-hosted PostgreSQL**
```bash
# Tạo database
createdb lunavia_prod

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE lunavia_prod;
```

#### 2.2. Run Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://user:password@host:5432/lunavia_prod"

# Generate Prisma Client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npm run db:seed
```

**⚠️ LƯU Ý:** Không chạy `prisma migrate dev` trên production! Dùng `prisma migrate deploy`.

### 3. Build & Test

```bash
# Install dependencies
npm install

# Build production
npm run build

# Test production build locally
npm start
```

Kiểm tra:
- ✅ Build không có lỗi
- ✅ App chạy được trên localhost:3000
- ✅ Database connection OK
- ✅ Authentication hoạt động

---

## 🌐 CÁC PLATFORM DEPLOY

### Option 1: Vercel (Khuyến nghị cho Next.js)

#### Bước 1: Chuẩn bị

1. **Tạo tài khoản Vercel**: https://vercel.com
2. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

#### Bước 2: Deploy

```bash
# Login
vercel login

# Deploy lần đầu
vercel

# Deploy production
vercel --prod
```

#### Bước 3: Cấu hình Environment Variables

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm tất cả biến môi trường từ checklist trên
3. **Quan trọng**: Set cho cả `Production`, `Preview`, và `Development`

#### Bước 4: Cấu hình Database

**Option A: Vercel Postgres (Khuyến nghị)**
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string → Thêm vào Environment Variables

**Option B: External Database**
- Dùng Supabase, Neon, hoặc AWS RDS
- Thêm `DATABASE_URL` vào Environment Variables

#### Bước 5: Run Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Deploy migrations
npx prisma migrate deploy
```

#### Bước 6: Custom Domain (Optional)

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain
3. Follow DNS instructions

---

### Option 2: Railway

#### Bước 1: Setup

1. Tạo tài khoản: https://railway.app
2. New Project → Deploy from GitHub

#### Bước 2: Cấu hình

1. Add PostgreSQL service
2. Add environment variables
3. Railway tự động deploy khi push code

#### Bước 3: Run Migrations

Railway có thể chạy migrations tự động qua `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100

[[services]]
name = "migrate"
command = "npx prisma migrate deploy"
```

---

### Option 3: DigitalOcean App Platform

#### Bước 1: Setup

1. Tạo tài khoản: https://digitalocean.com
2. App Platform → Create App → GitHub

#### Bước 2: Cấu hình

1. Add PostgreSQL Database
2. Add Environment Variables
3. Build Command: `npm run build`
4. Run Command: `npm start`

---

### Option 4: AWS (EC2 + RDS)

#### Bước 1: Setup EC2

```bash
# SSH vào EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repo
git clone your-repo-url
cd lunavia

# Install dependencies
npm install
```

#### Bước 2: Setup RDS PostgreSQL

1. AWS Console → RDS → Create Database
2. Engine: PostgreSQL
3. Copy endpoint → Thêm vào `.env`

#### Bước 3: Deploy

```bash
# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "lunavia" -- start
pm2 save
pm2 startup
```

#### Bước 4: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Option 5: Docker + Docker Compose

#### Tạo Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=lunavia
      - POSTGRES_PASSWORD=your-password
      - POSTGRES_DB=lunavia
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy

```bash
# Build và start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

---

## 🔒 SECURITY CHECKLIST

### 1. Environment Variables
- ✅ Không commit `.env` files
- ✅ Sử dụng secrets management trên hosting platform
- ✅ Rotate secrets định kỳ

### 2. Database
- ✅ Sử dụng connection pooling
- ✅ Enable SSL cho database connection
- ✅ Backup database định kỳ
- ✅ Restrict database access (firewall)

### 3. Authentication
- ✅ NEXTAUTH_SECRET đủ mạnh (32+ chars)
- ✅ NEXTAUTH_URL đúng domain production
- ✅ Enable HTTPS

### 4. API Security
- ✅ Rate limiting (nếu cần)
- ✅ CORS configuration
- ✅ Input validation

---

## 📊 MONITORING & LOGGING

### 1. Error Tracking

**Option A: Sentry**
```bash
npm install @sentry/nextjs
```

**Option B: LogRocket**
```bash
npm install logrocket
```

### 2. Analytics

- **Vercel Analytics**: Tích hợp sẵn với Vercel
- **Google Analytics**: Thêm vào `_app.tsx`
- **PostHog**: Open-source alternative

### 3. Uptime Monitoring

- **UptimeRobot**: Free tier
- **Pingdom**: Enterprise
- **StatusCake**: Good free tier

---

## 🚀 DEPLOYMENT WORKFLOW

### Recommended: GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

Sau khi deploy, kiểm tra:

- [ ] Homepage load được
- [ ] Authentication hoạt động (login/logout)
- [ ] Database connection OK
- [ ] API endpoints trả về đúng
- [ ] File upload hoạt động (nếu có)
- [ ] Email notifications hoạt động (nếu có)
- [ ] SSL/HTTPS enabled
- [ ] Domain DNS configured
- [ ] Error tracking setup
- [ ] Analytics setup
- [ ] Backup strategy configured

---

## 🆘 TROUBLESHOOTING

### Build fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database connection error
- Kiểm tra `DATABASE_URL` format
- Kiểm tra firewall rules
- Kiểm tra database credentials

### Authentication not working
- Kiểm tra `NEXTAUTH_SECRET` và `NEXTAUTH_URL`
- Clear cookies và thử lại
- Kiểm tra callback URLs trong OAuth providers

### 500 errors
- Kiểm tra server logs
- Kiểm tra environment variables
- Kiểm tra database migrations

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs trên hosting platform
2. Kiểm tra database connection
3. Kiểm tra environment variables
4. Review error messages

---

## 🎉 HOÀN TẤT!

Sau khi hoàn thành tất cả bước trên, ứng dụng của bạn đã sẵn sàng live!

**URL Production**: https://yourdomain.com

**Test Accounts** (sau khi seed):
- Operator: `operator1@lunavia.com` / `password123`
- Guide: `guide1@lunavia.com` / `password123`
- Admin: `admin@lunavia.com` / `admin123`

