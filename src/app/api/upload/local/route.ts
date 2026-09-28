// filepath: src/app/api/upload/local/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STORAGE_ROOT = path.resolve(process.cwd(), ".storage");

// Enforce boundary containment to block directory traversal attacks (e.g. ../ or null bytes)
function getSafeStoragePath(key: string): string | null {
  const sanitizedKey = key.replace(/\0/g, "").trim();
  if (!sanitizedKey) return null;

  const resolvedPath = path.resolve(STORAGE_ROOT, sanitizedKey);

  if (!resolvedPath.startsWith(STORAGE_ROOT)) {
    return null;
  }

  return resolvedPath;
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Storage key parameter is required." },
        { status: 400 }
      );
    }

    const filePath = getSafeStoragePath(key);
    if (!filePath) {
      return NextResponse.json(
        { error: "Access denied: Invalid or escaping storage path." },
        { status: 400 }
      );
    }

    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      await fs.promises.mkdir(fileDir, { recursive: true });
    }

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, key }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Local Storage PUT Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save file to local storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Storage key parameter is required." },
        { status: 400 }
      );
    }

    const filePath = getSafeStoragePath(key);
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Asset not found in local storage vault." },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("[Local Storage GET Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to read file from local storage.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}