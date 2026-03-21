import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VN_PROVINCES, OUTBOUND_CITIES } from "../../../../prisma/seed-locations";

/**
 * GET /api/locations
 * 
 * Query params:
 *   country: ISO country code (e.g., VN, JP, KR)
 *   search: search by name
 *   region: filter by region
 * 
 * Returns cities/provinces for the given country, grouped by region.
 * Falls back to seed data if DB has no entries for the country.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const country = searchParams.get("country") || "VN";
        const search = searchParams.get("search");
        const region = searchParams.get("region");

        // "Others" free-text country — no predefined cities, UI shows text input
        if (country === "OTHER") {
            return NextResponse.json({
                country: "OTHER",
                cities: [],
                grouped: {},
                total: 0,
                freeText: true,
            });
        }

        // Try DB first
        const where: any = { country };
        if (region) where.region = region;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { nameLocal: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ];
        }

        let cities = await prisma.city.findMany({
            where,
            orderBy: { name: "asc" },
        });

        // If no DB entries, fall back to seed data
        if (cities.length === 0) {
            const seedData = country === "VN" ? VN_PROVINCES : OUTBOUND_CITIES.filter(c => c.country === country);
            let filtered = seedData;

            if (region) {
                filtered = filtered.filter(c => c.region === region);
            }
            if (search) {
                const q = search.toLowerCase();
                filtered = filtered.filter(c =>
                    c.name.toLowerCase().includes(q) ||
                    (c.nameLocal && c.nameLocal.toLowerCase().includes(q)) ||
                    c.code.toLowerCase().includes(q)
                );
            }

            cities = filtered.map((c, i) => ({
                id: `seed-${c.code}`,
                name: c.name,
                nameLocal: c.nameLocal || null,
                region: c.region,
                code: c.code,
                country: c.country,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
        }

        // Group by region
        const grouped: Record<string, typeof cities> = {};
        for (const city of cities) {
            const r = city.region || "Other";
            if (!grouped[r]) grouped[r] = [];
            grouped[r].push(city);
        }

        return NextResponse.json({
            country,
            cities,
            grouped,
            total: cities.length,
        });
    } catch (error: any) {
        console.error("Error fetching locations:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
