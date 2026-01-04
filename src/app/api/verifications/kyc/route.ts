import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { SubmitKycUseCase } from "@/application/use-cases/verification/submit-kyc.use-case";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[KYC Submit ${requestId}] Starting KYC submission request`);
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log(`[KYC Submit ${requestId}] Unauthorized - no session`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[KYC Submit ${requestId}] User: ${session.user.email} (${session.user.id})`);

    const body = await req.json();
    const { photoUrl, idDocumentUrl, licenseUrl, proofOfAddressUrl } = body;
    
    // Log received data
    console.log(`[KYC Submit ${requestId}] Received data:`, {
      photoUrl: Array.isArray(photoUrl) ? `${photoUrl.length} files` : typeof photoUrl,
      idDocumentUrl: Array.isArray(idDocumentUrl) ? `${idDocumentUrl.length} files` : typeof idDocumentUrl,
      licenseUrl: Array.isArray(licenseUrl) ? `${licenseUrl.length} files` : typeof licenseUrl,
      proofOfAddressUrl: Array.isArray(proofOfAddressUrl) ? `${proofOfAddressUrl.length} files` : typeof proofOfAddressUrl,
    });

    // Validate each field is an array and has max 5 files
    const validateField = (field: any, fieldName: string) => {
      if (!Array.isArray(field)) {
        return `${fieldName} phải là một mảng`;
      }
      if (field.length === 0) {
        return `${fieldName} cần ít nhất 1 file`;
      }
      if (field.length > 5) {
        return `${fieldName} chỉ được tối đa 5 files`;
      }
      return null;
    };

    const errors: string[] = [];
    const photoError = validateField(photoUrl, "Hình ảnh thật");
    if (photoError) errors.push(photoError);
    
    const idError = validateField(idDocumentUrl, "CMND/CCCD/Hộ chiếu");
    if (idError) errors.push(idError);
    
    const licenseError = validateField(licenseUrl, "Thẻ HDV du lịch");
    if (licenseError) errors.push(licenseError);
    
    const proofError = validateField(proofOfAddressUrl, "Chứng minh nơi ở");
    if (proofError) errors.push(proofError);

    if (errors.length > 0) {
      console.log(`[KYC Submit ${requestId}] Validation errors:`, errors);
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    console.log(`[KYC Submit ${requestId}] Validation passed, calling use case...`);
    
    // Filter out null/undefined values from arrays before submitting
    const cleanArray = (arr: any[] | null | undefined): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((item): item is string => item != null && typeof item === 'string');
    };

    const useCase = new SubmitKycUseCase();
    const verification = await useCase.execute({
      guideId: session.user.id,
      photoUrl: cleanArray(photoUrl),
      idDocumentUrl: cleanArray(idDocumentUrl),
      licenseUrl: cleanArray(licenseUrl),
      proofOfAddressUrl: cleanArray(proofOfAddressUrl),
    });

    const duration = Date.now() - startTime;
    console.log(`[KYC Submit ${requestId}] ✅ Success! Verification ID: ${verification.id}`);
    console.log(`[KYC Submit ${requestId}] Documents saved:`, {
      documentsArrayLength: Array.isArray(verification.documents) ? verification.documents.length : 0,
      photoUrl: verification.photoUrl ? "✅" : "❌",
      idDocumentUrl: verification.idDocumentUrl ? "✅" : "❌",
      licenseUrl: verification.licenseUrl ? "✅" : "❌",
      proofOfAddressUrl: verification.proofOfAddressUrl ? "✅" : "❌",
      adminNotes: verification.adminNotes ? "✅" : "❌",
    });
    console.log(`[KYC Submit ${requestId}] Duration: ${duration}ms`);

    return NextResponse.json(verification);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[KYC Submit ${requestId}] ❌ Error after ${duration}ms:`, error);
    console.error(`[KYC Submit ${requestId}] Error stack:`, error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

