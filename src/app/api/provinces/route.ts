import { NextRequest, NextResponse } from "next/server";
import { VN_PROVINCES } from "@/../prisma/seed-locations";

/**
 * GET /api/provinces — List Vietnamese provinces grouped by region
 * Returns: { provinces: Array<{ code, name, nameLocal, region }> }
 */
export async function GET(req: NextRequest) {
    try {
        const provinces = VN_PROVINCES.map((p) => ({
            code: p.code,
            name: p.name,
            nameLocal: p.nameLocal || p.name,
            region: p.region,
        }));

        return NextResponse.json({ provinces });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
