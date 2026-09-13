// filepath: src/app/api/upload/local/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Storage key is required" }, { status: 400 });
    }

    // Isolate storage inside .storage/ in project root
    const localStorageDir = path.join(process.cwd(), ".storage");
    const filePath = path.join(localStorageDir, key);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Read binary data directly from incoming stream
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, key }, { status: 200 });
  } catch (error: any) {
    console.error("[Local Storage PUT Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save file to local development storage" },
      { status: 500 }
    );
  }
}