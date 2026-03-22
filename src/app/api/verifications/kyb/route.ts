import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { SubmitKybUseCase } from "@/application/use-cases/verification/submit-kyb.use-case";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[KYB Submit ${requestId}] Starting KYB submission request`);
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log(`[KYB Submit ${requestId}] Unauthorized - no session`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[KYB Submit ${requestId}] User: ${session.user.email} (${session.user.id})`);

    const body = await req.json();
    const { photoUrl, idDocumentUrl, licenseUrl, travelLicenseUrl, proofOfAddressUrl } = body;
    
    // Log received data
    console.log(`[KYB Submit ${requestId}] Received data:`, {
      photoUrl: Array.isArray(photoUrl) ? `${photoUrl.length} files` : typeof photoUrl,
      idDocumentUrl: Array.isArray(idDocumentUrl) ? `${idDocumentUrl.length} files` : typeof idDocumentUrl,
      licenseUrl: Array.isArray(licenseUrl) ? `${licenseUrl.length} files` : typeof licenseUrl,
      travelLicenseUrl: Array.isArray(travelLicenseUrl) ? `${travelLicenseUrl.length} files` : typeof travelLicenseUrl,
      proofOfAddressUrl: Array.isArray(proofOfAddressUrl) ? `${proofOfAddressUrl.length} files` : typeof proofOfAddressUrl,
    });
    
    // Log actual URLs (first 100 chars of each) - filter out null/undefined
    if (Array.isArray(photoUrl) && photoUrl.length > 0) {
      console.log(`[KYB Submit ${requestId}] photoUrl files:`, photoUrl.filter(Boolean).map(url => url && typeof url === 'string' ? url.substring(0, 100) : 'null'));
    }
    if (Array.isArray(idDocumentUrl) && idDocumentUrl.length > 0) {
      console.log(`[KYB Submit ${requestId}] idDocumentUrl files:`, idDocumentUrl.filter(Boolean).map(url => url && typeof url === 'string' ? url.substring(0, 100) : 'null'));
    }

    // Validate each field is an array and has max 5 files
    const validateField = (field: any, fieldName: string) => {
      if (!Array.isArray(field)) {
        return `${fieldName} must be an array`;
      }
      if (field.length === 0) {
        return `${fieldName} requires at least 1 file`;
      }
      if (field.length > 5) {
        return `${fieldName} allows a maximum of 5 files`;
      }
      return null;
    };

    const errors: string[] = [];
    const photoError = validateField(photoUrl, "Real Photo");
    if (photoError) errors.push(photoError);
    
    const idError = validateField(idDocumentUrl, "National ID / Passport");
    if (idError) errors.push(idError);
    
    const licenseError = validateField(licenseUrl, "Business License");
    if (licenseError) errors.push(licenseError);
    
    // Travel license is optional for TOUR_AGENCY
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user?.role === "TOUR_OPERATOR") {
      const travelError = validateField(travelLicenseUrl, "Travel License");
      if (travelError) errors.push(travelError);
    }
    
    const proofError = validateField(proofOfAddressUrl, "Proof of address");
    if (proofError) errors.push(proofError);

    if (errors.length > 0) {
      console.log(`[KYB Submit ${requestId}] Validation errors:`, errors);
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    console.log(`[KYB Submit ${requestId}] Validation passed, calling use case...`);
    
    // Filter out null/undefined values from arrays before submitting
    const cleanArray = (arr: any[] | null | undefined): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((item): item is string => item != null && typeof item === 'string');
    };

    const useCase = new SubmitKybUseCase();
    const verification = await useCase.execute({
      operatorId: session.user.id,
      photoUrl: cleanArray(photoUrl),
      idDocumentUrl: cleanArray(idDocumentUrl),
      licenseUrl: cleanArray(licenseUrl),
      travelLicenseUrl: cleanArray(travelLicenseUrl),
      proofOfAddressUrl: cleanArray(proofOfAddressUrl),
    });

    const duration = Date.now() - startTime;
    console.log(`[KYB Submit ${requestId}] ✅ Success! Verification ID: ${verification.id}`);
    console.log(`[KYB Submit ${requestId}] Documents saved:`, {
      documentsArrayLength: Array.isArray(verification.documents) ? verification.documents.length : 0,
      photoUrl: verification.photoUrl ? "✅" : "❌",
      idDocumentUrl: verification.idDocumentUrl ? "✅" : "❌",
      licenseUrl: verification.licenseUrl ? "✅" : "❌",
      travelLicenseUrl: verification.travelLicenseUrl ? "✅" : "❌",
      proofOfAddressUrl: verification.proofOfAddressUrl ? "✅" : "❌",
      adminNotes: verification.adminNotes ? "✅" : "❌",
    });
    console.log(`[KYB Submit ${requestId}] Duration: ${duration}ms`);

    return NextResponse.json(verification);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[KYB Submit ${requestId}] ❌ Error after ${duration}ms:`, error);
    console.error(`[KYB Submit ${requestId}] Error stack:`, error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

