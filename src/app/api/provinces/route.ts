import { NextRequest, NextResponse } from "next/server";

/** GET /api/provinces — List provinces/regions */
export async function GET(req: NextRequest) {
  try {
    const provinces = [
      "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hội An", "Huế", "Nha Trang", "Đà Lạt",
      "Phú Quốc", "Sa Pa", "Hạ Long", "Ninh Bình", "Cần Thơ", "Quy Nhơn", "Vũng Tàu",
      "Phan Thiết", "Cát Bà", "Tam Đảo", "Mai Châu", "Bắc Hà", "Côn Đảo"
    ];
    return NextResponse.json(provinces);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
