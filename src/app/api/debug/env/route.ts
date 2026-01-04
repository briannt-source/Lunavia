import { NextResponse } from "next/server";

export async function GET() {
  // Do NOT return secret values. Return presence and length only.
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const nextAuthSecretLength = process.env.NEXTAUTH_SECRET
    ? process.env.NEXTAUTH_SECRET.length
    : 0;

  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const databaseUrlLength = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.length
    : 0;

  return NextResponse.json({
    hasNextAuthSecret,
    nextAuthSecretLength,
    hasDatabaseUrl,
    databaseUrlLength,
    nodeEnv: process.env.NODE_ENV || null,
  });
}
