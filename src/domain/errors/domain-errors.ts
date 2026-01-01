/**
 * Domain Errors
 * Custom error classes for domain layer
 */

export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InsufficientBalanceError extends DomainError {
  constructor(message: string = "Insufficient balance") {
    super(message, "INSUFFICIENT_BALANCE");
  }
}

export class InvalidAmountError extends DomainError {
  constructor(message: string = "Invalid amount") {
    super(message, "INVALID_AMOUNT");
  }
}

export class TourNotFoundError extends DomainError {
  constructor(message: string = "Tour not found") {
    super(message, "TOUR_NOT_FOUND");
  }
}

export class UserNotFoundError extends DomainError {
  constructor(message: string = "User not found") {
    super(message, "USER_NOT_FOUND");
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED");
  }
}

export class ValidationError extends DomainError {
  constructor(message: string = "Validation failed") {
    super(message, "VALIDATION_ERROR");
  }
}

export class ConflictError extends DomainError {
  constructor(message: string = "Conflict detected") {
    super(message, "CONFLICT_ERROR");
  }
}

export class EscrowError extends DomainError {
  constructor(message: string = "Escrow operation failed") {
    super(message, "ESCROW_ERROR");
  }
}

export class PaymentError extends DomainError {
  constructor(message: string = "Payment operation failed") {
    super(message, "PAYMENT_ERROR");
  }
}

