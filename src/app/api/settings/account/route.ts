import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { currentPassword, newPassword, newEmail } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update email
    if (newEmail && newEmail !== user.email) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          email: newEmail,
          emailVerified: null, // Require re-verification
        },
      });
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Vui lòng nhập mật khẩu hiện tại" },
          { status: 400 }
        );
      }

      // Verify current password
      if (!user.password) {
        return NextResponse.json(
          { error: "Tài khoản chưa có mật khẩu" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không đúng" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: newEmail
        ? "Email đã được cập nhật. Vui lòng xác minh email mới."
        : "Mật khẩu đã được cập nhật thành công.",
    });
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

