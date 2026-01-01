import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WalletService } from "@/domain/services/wallet.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { canCreate: false, reason: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const canCreate = await WalletService.canCreateTour(session.user.id);

    return NextResponse.json(canCreate);
  } catch (error: any) {
    console.error("Error checking create permission:", error);
    return NextResponse.json(
      { canCreate: false, reason: "Lỗi kiểm tra quyền" },
      { status: 500 }
    );
  }
}

