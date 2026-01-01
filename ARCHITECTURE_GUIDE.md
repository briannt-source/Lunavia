# LUNAVIA Architecture Guide

## Tổng quan

LUNAVIA được xây dựng theo **Clean Architecture** và **SOLID principles**, đảm bảo code dễ maintain, test, và extend. Codebase được thiết kế để có thể share business logic giữa Web và Mobile app.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Next.js Pages, React Components, API Routes)          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Application Layer                        │
│  (Use Cases, DTOs, Application Services)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Domain Layer                           │
│  (Entities, Domain Services, Business Logic)             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                Infrastructure Layer                       │
│  (Database, External APIs, File Storage)                  │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                          # Next.js App Router (Presentation)
│   ├── api/                      # API Routes (Controllers)
│   │   ├── tours/
│   │   ├── guides/
│   │   ├── wallet/
│   │   └── ...
│   ├── dashboard/                # Dashboard Pages
│   ├── tours/                    # Tour Pages
│   └── auth/                     # Auth Pages
│
├── application/                  # Application Layer
│   ├── use-cases/               # Use Cases (Business Operations)
│   │   ├── tour/
│   │   ├── application/
│   │   ├── wallet/
│   │   ├── company/
│   │   └── ...
│   └── dto/                      # Data Transfer Objects
│
├── domain/                       # Domain Layer (Core Business Logic)
│   ├── entities/                 # Domain Entities (nếu cần)
│   ├── services/                 # Domain Services
│   │   ├── wallet.service.ts
│   │   ├── notification.service.ts
│   │   ├── verification.service.ts
│   │   ├── availability.service.ts
│   │   ├── company.service.ts
│   │   └── platform-fee.service.ts
│   └── repositories/             # Repository Interfaces (nếu cần)
│
├── infrastructure/               # Infrastructure Layer
│   ├── database/                 # Database Access
│   │   └── prisma/               # Prisma Client
│   ├── external/                 # External Services
│   │   └── ai/                   # AI Services
│   └── storage/                  # File Storage
│
├── components/                   # React Components (Presentation)
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   └── ...
│
└── lib/                          # Shared Utilities
    ├── prisma.ts                 # Prisma Client instance
    ├── auth-config.ts            # NextAuth config
    ├── api-client.ts             # API Client (có thể share với mobile)
    └── utils.ts                  # Utility functions
```

## Clean Architecture Principles

### 1. Dependency Rule
- **Inner layers không phụ thuộc vào outer layers**
- **Dependencies chỉ point inward**

```
Domain Layer (Core)
    ↑
Application Layer
    ↑
Infrastructure Layer
    ↑
Presentation Layer
```

### 2. Layer Responsibilities

#### Domain Layer (Core Business Logic)
- **Entities**: Business objects (User, Tour, Payment, etc.)
- **Domain Services**: Business logic không thuộc về một entity cụ thể
- **Value Objects**: Immutable objects (Money, DateRange, etc.)
- **Repository Interfaces**: Contracts cho data access

**Rules:**
- ✅ Không phụ thuộc vào framework
- ✅ Không phụ thuộc vào database
- ✅ Pure business logic
- ✅ Có thể test độc lập

**Example:**
```typescript
// domain/services/wallet.service.ts
export class WalletService {
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    tourId?: string
  ) {
    // Pure business logic
    // No database, no framework dependencies
  }
}
```

#### Application Layer (Use Cases)
- **Use Cases**: Orchestrate domain logic
- **DTOs**: Data structures for use case input/output
- **Application Services**: Coordinate multiple use cases

**Rules:**
- ✅ Phụ thuộc vào Domain Layer
- ✅ Không phụ thuộc vào Infrastructure
- ✅ Orchestrate business operations
- ✅ Handle transactions

**Example:**
```typescript
// application/use-cases/wallet/pay-guide-for-tour.use-case.ts
export class PayGuideForTourUseCase {
  async execute(input: PayGuideInput) {
    // 1. Validate input
    // 2. Call domain services
    // 3. Handle transactions
    // 4. Return result
  }
}
```

#### Infrastructure Layer (External Concerns)
- **Database**: Prisma queries
- **External APIs**: Third-party services
- **File Storage**: Upload/download files
- **Email**: Send emails

**Rules:**
- ✅ Implement domain interfaces
- ✅ Handle technical details
- ✅ Can be swapped easily

**Example:**
```typescript
// infrastructure/database/prisma.ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

#### Presentation Layer (UI/API)
- **API Routes**: Handle HTTP requests
- **React Components**: UI components
- **Pages**: Next.js pages

**Rules:**
- ✅ Phụ thuộc vào Application Layer
- ✅ Handle HTTP/UI concerns
- ✅ Validate input
- ✅ Format output

**Example:**
```typescript
// app/api/wallet/pay/route.ts
export async function POST(req: NextRequest) {
  const useCase = new PayGuideForTourUseCase();
  const result = await useCase.execute(input);
  return NextResponse.json(result);
}
```

## SOLID Principles

### 1. Single Responsibility Principle (SRP)
Mỗi class/function chỉ có một lý do để thay đổi.

**Good:**
```typescript
// Domain Service: Chỉ handle wallet logic
export class WalletService {
  static async transfer(...) { }
  static async checkBalance(...) { }
}

// Use Case: Chỉ orchestrate payment flow
export class PayGuideForTourUseCase {
  async execute(...) {
    // Orchestrate, không implement business logic
  }
}
```

**Bad:**
```typescript
// ❌ Mixing concerns
export class PaymentService {
  async payGuide() { }
  async sendEmail() { }  // Should be in NotificationService
  async updateDatabase() { }  // Should be in Repository
}
```

### 2. Open/Closed Principle (OCP)
Open for extension, closed for modification.

**Good:**
```typescript
// Interface-based design
interface PaymentProcessor {
  process(amount: number): Promise<void>;
}

class EscrowProcessor implements PaymentProcessor {
  async process(amount: number) { }
}

class DirectProcessor implements PaymentProcessor {
  async process(amount: number) { }
}
```

### 3. Liskov Substitution Principle (LSP)
Subtypes phải có thể thay thế base types.

**Good:**
```typescript
// All payment processors implement same interface
const processor: PaymentProcessor = new EscrowProcessor();
await processor.process(amount);  // Works with any implementation
```

### 4. Interface Segregation Principle (ISP)
Clients không nên phụ thuộc vào interfaces mà họ không dùng.

**Good:**
```typescript
// Separate interfaces
interface PaymentReader {
  readPayment(id: string): Promise<Payment>;
}

interface PaymentWriter {
  writePayment(payment: Payment): Promise<void>;
}

// Client chỉ implement what they need
class PaymentRepository implements PaymentReader, PaymentWriter {
  // ...
}
```

### 5. Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions.

**Good:**
```typescript
// Use Case depends on interface
interface IWalletRepository {
  findById(id: string): Promise<Wallet>;
}

class PayGuideUseCase {
  constructor(private walletRepo: IWalletRepository) {}
}
```

## Code Organization Best Practices

### 1. Use Cases
- Mỗi use case = một file
- Tên file: `[action]-[entity].use-case.ts`
- Input/Output types rõ ràng

```typescript
// application/use-cases/wallet/pay-guide-for-tour.use-case.ts
export interface PayGuideInput {
  operatorId: string;
  guideId: string;
  tourId: string;
  amount: number;
}

export interface PayGuideOutput {
  paymentId: string;
  status: string;
}

export class PayGuideForTourUseCase {
  async execute(input: PayGuideInput): Promise<PayGuideOutput> {
    // Implementation
  }
}
```

### 2. Domain Services
- Pure business logic
- Static methods (stateless)
- No side effects (except through repositories)

```typescript
// domain/services/wallet.service.ts
export class WalletService {
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number
  ) {
    // Business logic only
  }
}
```

### 3. API Routes
- Thin controllers
- Delegate to use cases
- Handle HTTP concerns only

```typescript
// app/api/wallet/pay/route.ts
export async function POST(req: NextRequest) {
  // 1. Validate session
  // 2. Parse input
  // 3. Call use case
  // 4. Return response
}
```

### 4. Error Handling
- Domain errors: Throw domain exceptions
- Application errors: Handle and convert
- Presentation errors: Format for client

```typescript
// Domain
throw new Error("Insufficient balance");

// Application
try {
  await WalletService.transfer(...);
} catch (error) {
  if (error.message === "Insufficient balance") {
    throw new InsufficientBalanceError(error.message);
  }
}

// Presentation
try {
  const result = await useCase.execute(...);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    return NextResponse.json({ error: "Số dư không đủ" }, { status: 400 });
  }
}
```

## Mobile App Compatibility

### Shared Code Strategy

#### 1. Business Logic Layer (Shareable)
```
shared/
├── domain/              # Domain logic (pure TypeScript)
│   ├── services/
│   └── entities/
├── application/         # Use cases (pure TypeScript)
│   └── use-cases/
└── types/               # Shared types
```

#### 2. API Client (Shareable)
```typescript
// lib/api-client.ts (có thể share với mobile)
export const api = {
  tours: {
    list: async () => { },
    get: async (id: string) => { },
  },
  // ...
};
```

#### 3. Platform-Specific
- **Web**: Next.js pages, React components
- **Mobile**: React Native screens, native components

### Implementation Plan

1. **Extract Business Logic:**
   - Move domain services to `shared/domain/`
   - Move use cases to `shared/application/`
   - Keep infrastructure separate

2. **API-First Design:**
   - All business logic accessible via API
   - Mobile app calls same APIs
   - Web và Mobile share API client

3. **Type Safety:**
   - Shared TypeScript types
   - API contracts
   - DTOs

## Testing Strategy

### Unit Tests
- Domain services
- Use cases
- Domain logic

### Integration Tests
- API endpoints
- Database operations
- External services

### E2E Tests
- Critical user flows
- Payment flows
- Tour creation/application

## Code Review Checklist

- [ ] Follows Clean Architecture layers
- [ ] Follows SOLID principles
- [ ] No circular dependencies
- [ ] Proper error handling
- [ ] Type safety (TypeScript)
- [ ] Input validation
- [ ] Transaction handling
- [ ] Logging for debugging
- [ ] Comments for complex logic
- [ ] No business logic in API routes
- [ ] No business logic in React components

## Migration to Mobile-Ready

### Phase 1: Refactor Current Code
1. Extract domain services
2. Extract use cases
3. Create shared types
4. API-first design

### Phase 2: Create Shared Package
1. Create `shared/` directory
2. Move business logic
3. Create npm package (optional)

### Phase 3: Mobile Integration
1. React Native project
2. Use shared API client
3. Platform-specific UI

## Current Architecture Assessment

### ✅ Strengths:
- Clear separation of concerns
- Use cases pattern
- Domain services pattern
- Type safety with TypeScript

### ⚠️ Areas for Improvement:
1. **Repository Pattern**: Chưa có repository interfaces
2. **Error Handling**: Cần standardize error types
3. **Dependency Injection**: Có thể improve
4. **Testing**: Cần thêm unit tests
5. **Shared Code**: Chưa extract cho mobile

## Next Steps

1. Implement Escrow System với Clean Architecture
2. Create repository interfaces
3. Standardize error handling
4. Extract shared code
5. Add unit tests

