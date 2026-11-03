/** Lane: api. GET /api/packs/[code] -> CoursePack */
import { NextResponse } from "next/server";
import type { ApiError, CoursePack } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json<ApiError>({ error: "Course code is required" }, { status: 400 });
    }

    const decoded = decodeURIComponent(code.trim());
    const { pack, isMocked } = findPack(decoded);

    if (!pack) {
      return NextResponse.json<ApiError>({ error: `Course pack not found for '${decoded}'` }, { status: 404 });
    }

    const headers: Record<string, string> = {};
    if (isMocked || pack.mocked) {
      headers["x-mocked"] = "1";
    }

    return NextResponse.json<CoursePack>(pack, { headers });
  } catch (err) {
    console.error("[api/packs/[code]] error:", err);
    return NextResponse.json<ApiError>({ error: "Failed to load course pack" }, { status: 500 });
  }
}
