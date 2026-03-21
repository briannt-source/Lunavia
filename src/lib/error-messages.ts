/**
 * Utility functions to convert technical error messages to user-friendly messages
 */

export function getUserFriendlyError(error: any): string {
  const errorMessage = error?.message || String(error) || "An error occurred";

  // Prisma errors
  if (errorMessage.includes("Invalid `prisma")) {
    return parsePrismaError(errorMessage);
  }

  // Date validation errors
  if (errorMessage.includes("Invalid Date") || errorMessage.includes("Expected Date")) {
    if (errorMessage.includes("startDate")) {
      return "Please enter a valid tour start date (format: DD/MM/YYYY)";
    }
    if (errorMessage.includes("endDate")) {
      return "Please enter a valid tour end date (format: DD/MM/YYYY)";
    }
    return "Please enter a valid date (format: DD/MM/YYYY)";
  }

  // Required field errors
  if (errorMessage.includes("Required") || errorMessage.includes("is required")) {
    const field = extractFieldName(errorMessage);
    return `Please fill in: ${getFieldLabel(field)}`;
  }

  // Type errors
  if (errorMessage.includes("Expected") && errorMessage.includes("provided")) {
    const field = extractFieldName(errorMessage);
    return `Information ${getFieldLabel(field)} has invalid format`;
  }

  // Unique constraint errors
  if (errorMessage.includes("Unique constraint") || errorMessage.includes("already exists")) {
    if (errorMessage.includes("email")) {
      return "This email is already in use. Please use a different email.";
    }
    return "This information already exists in the system";
  }

  // Foreign key errors
  if (errorMessage.includes("Foreign key constraint") || errorMessage.includes("does not exist")) {
    return "Invalid information. Please check again.";
  }

  // Network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return "Connection error. Please check your internet connection and try again.";
  }

  // Return original message if it's already user-friendly (Vietnamese)
  if (isUserFriendlyMessage(errorMessage)) {
    return errorMessage;
  }

  // Default fallback
  return "An error occurred. Please try again later.";
}

function parsePrismaError(errorMessage: string): string {
  // Extract field name from Prisma error
  const fieldMatch = errorMessage.match(/`(\w+)`/);
  const field = fieldMatch ? fieldMatch[1] : "";

  // Check for specific error types
  if (errorMessage.includes("Invalid value") && errorMessage.includes("Date")) {
    if (field.includes("start") || field.includes("Start")) {
      return "Please enter a valid tour start date";
    }
    if (field.includes("end") || field.includes("End")) {
      return "Please enter a valid tour end date";
    }
    return "Please enter a valid date";
  }

  if (errorMessage.includes("Required")) {
    return `Please fill in: ${getFieldLabel(field)}`;
  }

  if (errorMessage.includes("Expected") && errorMessage.includes("provided")) {
    return `Information ${getFieldLabel(field)} has invalid format. Please check again.`;
  }

  return `Information ${getFieldLabel(field)} is invalid. Please check again.`;
}

function extractFieldName(errorMessage: string): string {
  // Try to extract field name from various error formats
  const patterns = [
    /`(\w+)`/,
    /(\w+):/,
    /field (\w+)/i,
    /(\w+) is required/i,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return "";
}

function getFieldLabel(field: string): string {
  const fieldLabels: Record<string, string> = {
    title: "Tour title",
    description: "Description tour",
    city: "City",
    startDate: "Start date",
    endDate: "End date",
    pax: "Number of guests",
    priceMain: "Main guide price",
    priceSub: "Sub guide price",
    currency: "Currency",
    email: "Email",
    password: "Password",
    name: "Name",
    licenseNumber: "License number",
    companyName: "Company name",
    phone: "Phone number",
    address: "Address",
    amount: "Amount",
    method: "Method",
    role: "Role",
    coverLetter: "Cover letter",
    languages: "Languages",
    specialties: "Specialties",
    durationHours: "Duration (hours)",
    mainGuideSlots: "Main guide slots",
    subGuideSlots: "Sub guide slots",
  };

  return fieldLabels[field.toLowerCase()] || field;
}

function isUserFriendlyMessage(message: string): boolean {
  // Check if message is already in Vietnamese or user-friendly format
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
 * Validate form data and return user-friendly error messages
 */
export function validateTourData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Please enter tour title");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Please enter tour description");
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push("Please select a city");
  }

  if (!data.startDate) {
    errors.push("Please enter tour start date");
  } else {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push("Start date is invalid. Please enter correct format (DD/MM/YYYY)");
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push("End date is invalid. Please enter correct format (DD/MM/YYYY)");
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate < startDate) {
        errors.push("End date must be after start date");
      }
    }
  }

  if (!data.pax || data.pax <= 0) {
    errors.push("Please enter valid guest count (greater than 0)");
  }

  if (data.priceMain !== null && data.priceMain !== undefined && data.priceMain < 0) {
    errors.push("Main guide price cannot be negative");
  }

  if (data.priceSub !== null && data.priceSub !== undefined && data.priceSub < 0) {
    errors.push("Sub guide price cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}












