import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ liveAvailable: Boolean(process.env.OPENAI_API_KEY) });
}
