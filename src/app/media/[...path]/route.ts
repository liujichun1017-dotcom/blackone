import { NextResponse } from "next/server";
import { readStorageFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const relativePath = path.join("/");

  if (!relativePath || relativePath.includes("..")) {
    return NextResponse.json({ error: "无效路径。" }, { status: 400 });
  }

  try {
    const asset = await readStorageFile(relativePath);
    return new NextResponse(asset.file, {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "文件不存在。" }, { status: 404 });
  }
}
