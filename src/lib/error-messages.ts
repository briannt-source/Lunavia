/**
 * Utility functions to convert technical error messages to user-friendly messages
 */

export function getUserFriendlyError(error: any): string {
  const errorMessage = error?.message || String(error) || "Đã có lỗi xảy ra";

  // Prisma errors
  if (errorMessage.includes("Invalid `prisma")) {
    return parsePrismaError(errorMessage);
  }

  // Date validation errors
  if (errorMessage.includes("Invalid Date") || errorMessage.includes("Expected Date")) {
    if (errorMessage.includes("startDate")) {
      return "Vui lòng nhập ngày bắt đầu tour hợp lệ (định dạng: DD/MM/YYYY)";
    }
    if (errorMessage.includes("endDate")) {
      return "Vui lòng nhập ngày kết thúc tour hợp lệ (định dạng: DD/MM/YYYY)";
    }
    return "Vui lòng nhập ngày hợp lệ (định dạng: DD/MM/YYYY)";
  }

  // Required field errors
  if (errorMessage.includes("Required") || errorMessage.includes("is required")) {
    const field = extractFieldName(errorMessage);
    return `Vui lòng điền thông tin: ${getFieldLabel(field)}`;
  }

  // Type errors
  if (errorMessage.includes("Expected") && errorMessage.includes("provided")) {
    const field = extractFieldName(errorMessage);
    return `Thông tin ${getFieldLabel(field)} không đúng định dạng`;
  }

  // Unique constraint errors
  if (errorMessage.includes("Unique constraint") || errorMessage.includes("already exists")) {
    if (errorMessage.includes("email")) {
      return "Email này đã được sử dụng. Vui lòng sử dụng email khác.";
    }
    return "Thông tin này đã tồn tại trong hệ thống";
  }

  // Foreign key errors
  if (errorMessage.includes("Foreign key constraint") || errorMessage.includes("does not exist")) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }

  // Network errors
  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return "Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại.";
  }

  // Return original message if it's already user-friendly (Vietnamese)
  if (isUserFriendlyMessage(errorMessage)) {
    return errorMessage;
  }

  // Default fallback
  return "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
}

function parsePrismaError(errorMessage: string): string {
  // Extract field name from Prisma error
  const fieldMatch = errorMessage.match(/`(\w+)`/);
  const field = fieldMatch ? fieldMatch[1] : "";

  // Check for specific error types
  if (errorMessage.includes("Invalid value") && errorMessage.includes("Date")) {
    if (field.includes("start") || field.includes("Start")) {
      return "Vui lòng nhập ngày bắt đầu tour hợp lệ";
    }
    if (field.includes("end") || field.includes("End")) {
      return "Vui lòng nhập ngày kết thúc tour hợp lệ";
    }
    return "Vui lòng nhập ngày hợp lệ";
  }

  if (errorMessage.includes("Required")) {
    return `Vui lòng điền thông tin: ${getFieldLabel(field)}`;
  }

  if (errorMessage.includes("Expected") && errorMessage.includes("provided")) {
    return `Thông tin ${getFieldLabel(field)} không đúng định dạng. Vui lòng kiểm tra lại.`;
  }

  return `Thông tin ${getFieldLabel(field)} không hợp lệ. Vui lòng kiểm tra lại.`;
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
    title: "Tiêu đề tour",
    description: "Mô tả tour",
    city: "Thành phố",
    startDate: "Ngày bắt đầu",
    endDate: "Ngày kết thúc",
    pax: "Số lượng khách",
    priceMain: "Giá HDV chính",
    priceSub: "Giá HDV phụ",
    currency: "Loại tiền tệ",
    email: "Email",
    password: "Mật khẩu",
    name: "Tên",
    licenseNumber: "Số giấy phép",
    companyName: "Tên công ty",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    amount: "Số tiền",
    method: "Phương thức",
    role: "Vai trò",
    coverLetter: "Thư xin việc",
    languages: "Ngôn ngữ",
    specialties: "Chuyên môn",
    durationHours: "Thời lượng (giờ)",
    mainGuideSlots: "Số lượng HDV chính",
    subGuideSlots: "Số lượng HDV phụ",
  };

  return fieldLabels[field.toLowerCase()] || field;
}

function isUserFriendlyMessage(message: string): boolean {
  // Check if message is already in Vietnamese or user-friendly format
  const vietnamesePatterns = [
    /vui lòng/i,
    /không thể/i,
    /đã có/i,
    /thành công/i,
    /thất bại/i,
    /lỗi/i,
    /cần/i,
    /phải/i,
  ];

  return vietnamesePatterns.some((pattern) => pattern.test(message));
}

/**
 * Validate form data and return user-friendly error messages
 */
export function validateTourData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Vui lòng nhập tiêu đề tour");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Vui lòng nhập mô tả tour");
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push("Vui lòng chọn thành phố");
  }

  if (!data.startDate) {
    errors.push("Vui lòng nhập ngày bắt đầu tour");
  } else {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push("Ngày bắt đầu không hợp lệ. Vui lòng nhập đúng định dạng (DD/MM/YYYY)");
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push("Ngày kết thúc không hợp lệ. Vui lòng nhập đúng định dạng (DD/MM/YYYY)");
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate < startDate) {
        errors.push("Ngày kết thúc phải sau ngày bắt đầu");
      }
    }
  }

  if (!data.pax || data.pax <= 0) {
    errors.push("Vui lòng nhập số lượng khách hợp lệ (lớn hơn 0)");
  }

  if (data.priceMain !== null && data.priceMain !== undefined && data.priceMain < 0) {
    errors.push("Giá HDV chính không được âm");
  }

  if (data.priceSub !== null && data.priceSub !== undefined && data.priceSub < 0) {
    errors.push("Giá HDV phụ không được âm");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}






