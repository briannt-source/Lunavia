/**
 * Error Handler
 * Centralized error handling for API routes
 */

import { NextResponse } from "next/server";
import {
  DomainError,
  InsufficientBalanceError,
  InvalidAmountError,
  TourNotFoundError,
  UserNotFoundError,
  UnauthorizedError,
  ValidationError,
  ConflictError,
  EscrowError,
  PaymentError,
} from "@/domain/errors/domain-errors";

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  console.error("Error:", error);

  // Handle domain errors
  if (error instanceof DomainError) {
    return handleDomainError(error);
  }

  // Handle known error types
  if (error instanceof Error) {
    // Prisma errors
    if (error.name === "PrismaClientKnownRequestError") {
      return NextResponse.json(
        {
          error: "Database error occurred",
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    // Generic errors
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

function handleDomainError(error: DomainError): NextResponse<ErrorResponse> {
  const statusMap: Record<string, number> = {
    INSUFFICIENT_BALANCE: 400,
    INVALID_AMOUNT: 400,
    TOUR_NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    VALIDATION_ERROR: 400,
    CONFLICT_ERROR: 409,
    ESCROW_ERROR: 400,
    PAYMENT_ERROR: 400,
  };

  const status = statusMap[error.code] || 500;

  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
    },
    { status }
  );
}

/**
 * Try-catch wrapper for API route handlers
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch(handleError);
}

