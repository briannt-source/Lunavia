import { NextResponse } from "next/server";
import { SUPPORTED_COUNTRIES, OUTBOUND_COUNTRIES } from "../../../../../prisma/seed-locations";

/**
 * GET /api/locations/countries
 * 
 * Query params:
 *   market: "outbound" → returns only outbound countries (excludes VN)
 *           "all" (default) → returns all supported countries
 * 
 * Returns list of supported countries with flags and local names.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const market = searchParams.get("market") || "all";

        const countries = market === "outbound" ? OUTBOUND_COUNTRIES : SUPPORTED_COUNTRIES;

        return NextResponse.json({
            countries,
            total: countries.length,
        });
    } catch (error: any) {
        console.error("Error fetching countries:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
