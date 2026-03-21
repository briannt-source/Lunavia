/**
 * Centralized API error handler for consistent error messages
 */

import { getUserFriendlyError } from "./error-messages";

/**
 * Handle API errors and return user-friendly messages
 */
export async function handleApiError(error: any): Promise<string> {
  // If error is already a user-friendly message, return it
  if (typeof error === "string" && isUserFriendlyMessage(error)) {
    return error;
  }

  // If error has a message property
  if (error?.error || error?.message) {
    const errorMessage = error.error || error.message;
    if (isUserFriendlyMessage(errorMessage)) {
      return errorMessage;
    }
    return getUserFriendlyError(errorMessage);
  }

  // Default fallback
  return getUserFriendlyError(error);
}

function isUserFriendlyMessage(message: string): boolean {
  const vietnamesePatterns = [
    /please/i,
    /cannot/i,
    /already/i,
    /success/i,
    /failed/i,
    /error/i,
    /need/i,
    /must/i,
  ];

  return vietnamesePatterns.some((pattern) => pattern.test(message));
}

/**
 * Wrap API calls with error handling
 */
export async function apiCall<T>(
  apiFunction: () => Promise<Response>
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await apiFunction();
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = await handleApiError(data);
      return { error: errorMessage };
    }

    return { data: data as T };
  } catch (error: any) {
    const errorMessage = await handleApiError(error);
    return { error: errorMessage };
  }
}












