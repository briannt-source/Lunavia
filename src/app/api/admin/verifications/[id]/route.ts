import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    const canAccess = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    // Reconstruct documents arrays from documents field
    // documents array contains all files in order: photoUrl files, idDocumentUrl files, licenseUrl files, travelLicenseUrl files, proofOfAddressUrl files
    const allDocuments: string[] = Array.isArray(verification.documents) 
      ? verification.documents.filter(Boolean) 
      : [];
    
    // Try to parse file counts from adminNotes
    let photoCount = 0, idCount = 0, licenseCount = 0, travelCount = 0, proofCount = 0;
    
    // Try to parse file counts from adminNotes (can be anywhere in the string, not just at start)
    if (verification.adminNotes) {
      const fileCountsMatch = verification.adminNotes.match(/FILE_COUNTS:([^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+)/);
      if (fileCountsMatch) {
        const countsStr = fileCountsMatch[1];
        const counts = countsStr.split("|").map(Number);
        if (counts.length >= 5) {
          [photoCount, idCount, licenseCount, travelCount, proofCount] = counts;
        }
      }
    }
    
    // If we don't have counts, estimate from legacy fields (at least 1 file per field that exists)
    // This is for backward compatibility with old data
    if (photoCount === 0 && idCount === 0 && licenseCount === 0 && travelCount === 0 && proofCount === 0) {
      photoCount = verification.photoUrl ? 1 : 0;
      idCount = verification.idDocumentUrl ? 1 : 0;
      licenseCount = verification.licenseUrl ? 1 : 0;
      travelCount = verification.travelLicenseUrl ? 1 : 0;
      proofCount = verification.proofOfAddressUrl ? 1 : 0;
      
      // For old data, try to estimate counts from allDocuments length
      // This is approximate but better than nothing
      const totalFiles = allDocuments.length;
      if (totalFiles > 0) {
        // Distribute files proportionally
        const hasTravel = verification.user.role === "TOUR_OPERATOR" && verification.travelLicenseUrl;
        const categories = [photoCount, idCount, licenseCount, travelCount, proofCount].filter(c => c > 0).length;
        if (categories > 0) {
          const avgPerCategory = Math.floor(totalFiles / categories);
          if (photoCount > 0) photoCount = Math.min(5, avgPerCategory);
          if (idCount > 0) idCount = Math.min(5, avgPerCategory);
          if (licenseCount > 0) licenseCount = Math.min(5, avgPerCategory);
          if (travelCount > 0) travelCount = Math.min(5, avgPerCategory);
          if (proofCount > 0) proofCount = Math.min(5, totalFiles - photoCount - idCount - licenseCount - travelCount);
        }
      }
    }
    
    // Reconstruct arrays based on counts
    let index = 0;
    const photoUrls = allDocuments.slice(index, index + photoCount);
    index += photoCount;
    
    const idDocumentUrls = allDocuments.slice(index, index + idCount);
    index += idCount;
    
    const licenseUrls = allDocuments.slice(index, index + licenseCount);
    index += licenseCount;
    
    const travelLicenseUrls = verification.user.role === "TOUR_OPERATOR" 
      ? allDocuments.slice(index, index + travelCount)
      : [];
    index += travelCount;
    
    const proofOfAddressUrls = allDocuments.slice(index, index + proofCount);
    
    // Fallback: if reconstructed arrays are empty but legacy fields exist, use legacy fields
    const organizedDocuments = {
      photoUrl: photoUrls.length > 0 ? photoUrls : (verification.photoUrl ? [verification.photoUrl] : []),
      idDocumentUrl: idDocumentUrls.length > 0 ? idDocumentUrls : (verification.idDocumentUrl ? [verification.idDocumentUrl] : []),
      licenseUrl: licenseUrls.length > 0 ? licenseUrls : (verification.licenseUrl ? [verification.licenseUrl] : []),
      travelLicenseUrl: travelLicenseUrls.length > 0 ? travelLicenseUrls : (verification.travelLicenseUrl ? [verification.travelLicenseUrl] : []),
      proofOfAddressUrl: proofOfAddressUrls.length > 0 ? proofOfAddressUrls : (verification.proofOfAddressUrl ? [verification.proofOfAddressUrl] : []),
      allDocuments: allDocuments.length > 0 ? allDocuments : [
        verification.photoUrl,
        verification.idDocumentUrl,
        verification.licenseUrl,
        verification.travelLicenseUrl,
        verification.proofOfAddressUrl,
      ].filter(Boolean),
    };

    return NextResponse.json({
      ...verification,
      documentsByType: organizedDocuments,
    });
  } catch (error: any) {
    console.error("Error fetching verification:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

