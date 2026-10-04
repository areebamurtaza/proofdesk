// filepath: src/app/api/review/[token]/asset/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isR2Configured, getR2ObjectBuffer } from "@/lib/r2";
import { burnWatermark } from "@/lib/watermark";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

function generateDemoWatermarkedSvg(title: string, versionNum: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="100%" height="100%">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#29466F" stroke-width="0.5" stroke-opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="1600" height="1000" fill="#0B1628"/>
    <rect width="1600" height="1000" fill="url(#grid)" />
    <circle cx="800" cy="500" r="320" fill="#172B4D" opacity="0.4" filter="blur(60px)"/>
    
    <g transform="translate(800, 360)">
      <rect x="-180" y="-80" width="360" height="90" rx="16" fill="#172B4D" stroke="#D7C3A5" stroke-width="2"/>
      <text x="0" y="-24" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#F8F6F1" text-anchor="middle" letter-spacing="4">
        PROOFDESK VAULT
      </text>
      <text x="0" y="8" font-family="monospace" font-size="14" font-weight="700" fill="#D7C3A5" text-anchor="middle" letter-spacing="2">
        ESCROW PROTECTED ASSET
      </text>
    </g>

    <text x="800" y="440" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#F8F6F1" text-anchor="middle">
      ${title} (Version ${versionNum})
    </text>

    <!-- Tiled Diagonal Watermark -->
    <g transform="translate(800, 500) rotate(-28)" opacity="0.35">
      <text x="-600" y="-300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="0" y="-300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="600" y="-300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-300" y="-150" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="300" y="-150" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-600" y="0" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="0" y="0" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="600" y="0" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-300" y="150" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="300" y="150" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-600" y="300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="0" y="300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      <text x="600" y="300" font-family="monospace" font-size="24" font-weight="900" fill="#D7C3A5" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
    </g>

    <!-- Center Security Banner -->
    <rect x="0" y="475" width="1600" height="50" fill="#0B1628" fill-opacity="0.9" stroke="#D7C3A5" stroke-width="1.5" />
    <text x="800" y="507" font-family="monospace" font-size="16" font-weight="bold" fill="#D7C3A5" text-anchor="middle" letter-spacing="2">
      ESCROW LOCKED • UNPAID DRAFT • UNAUTHORIZED FOR PRODUCTION
    </text>
  </svg>`;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;
    const versionParam = request.nextUrl.searchParams.get("version");

    if (!token) {
      return NextResponse.json({ error: "Review token is required." }, { status: 400 });
    }

    // Demo Deliverable Handler
    if (token === "demo-token") {
      const vNum = versionParam ? parseInt(versionParam, 10) : 1;
      const svg = generateDemoWatermarkedSvg("Aura Identity System", vNum);
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Query Deliverable from Database
    const deliverable = await prisma.deliverable.findUnique({
      where: { reviewToken: token },
      include: {
        versions: {
          orderBy: { versionNumber: "asc" },
        },
      },
    });

    if (!deliverable || deliverable.versions.length === 0) {
      return NextResponse.json(
        { error: "Deliverable review vault not found or asset has expired." },
        { status: 404 }
      );
    }

    // Resolve Requested Version
    let targetVersion = deliverable.versions[deliverable.versions.length - 1];
    if (versionParam) {
      const parsedNum = parseInt(versionParam, 10);
      const matched = deliverable.versions.find((v) => v.versionNumber === parsedNum);
      if (matched) targetVersion = matched;
    }

    // Fetch Asset Binary Buffer
    let assetBuffer: Buffer | null = null;
    let detectedMime = targetVersion.mimeType || "application/octet-stream";

    if (isR2Configured()) {
      // For unpaid deliverable, fetch preview key first; fall back to clean key
      const keyToFetch = deliverable.isUnlocked
        ? targetVersion.cleanFileKey
        : targetVersion.previewKey || targetVersion.cleanFileKey;

      try {
        const r2Result = await getR2ObjectBuffer(keyToFetch);
        assetBuffer = r2Result.buffer;
        detectedMime = r2Result.contentType || detectedMime;
      } catch (r2Err) {
        console.error(`[R2 Asset Fetch Failed for key ${keyToFetch}]:`, r2Err);
        // Fallback to clean key if preview key failed
        if (!deliverable.isUnlocked && targetVersion.cleanFileKey && keyToFetch !== targetVersion.cleanFileKey) {
          try {
            const fallbackResult = await getR2ObjectBuffer(targetVersion.cleanFileKey);
            assetBuffer = fallbackResult.buffer;
            detectedMime = fallbackResult.contentType || detectedMime;
          } catch (fallbackErr) {
            console.error("[R2 Fallback Fetch Failed]:", fallbackErr);
          }
        }
      }
    } else {
      // Local Storage Fallback
      const storageDir = path.join(process.cwd(), ".storage");
      const keyToFetch = deliverable.isUnlocked
        ? targetVersion.cleanFileKey
        : targetVersion.previewKey || targetVersion.cleanFileKey;

      try {
        const filePath = path.join(storageDir, keyToFetch);
        assetBuffer = await fs.readFile(filePath);
      } catch {
        // Try clean key if preview key not found
        try {
          const fallbackPath = path.join(storageDir, targetVersion.cleanFileKey);
          assetBuffer = await fs.readFile(fallbackPath);
        } catch (localErr) {
          console.error("[Local Storage Asset Read Failed]:", localErr);
        }
      }
    }

    if (!assetBuffer) {
      return NextResponse.json(
        { error: "Asset file payload could not be located in storage vault." },
        { status: 404 }
      );
    }

    // ESCROW ACCESS CONTROL ENFORCEMENT
    if (deliverable.isUnlocked) {
      // Approved & Paid: Serve Pristine Clean Master Asset
      return new NextResponse(new Uint8Array(assetBuffer), {
        status: 200,
        headers: {
          "Content-Type": detectedMime,
          "Cache-Control": "private, max-age=3600",
          "Content-Disposition": `inline; filename="${targetVersion.fileName}"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // UNPAID PREVIEW: ALWAYS BURN WATERMARK ON SERVER BEFORE TRANSMITTING
    try {
      const watermarkedJpeg = await burnWatermark(assetBuffer);

      return new NextResponse(new Uint8Array(watermarkedJpeg), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "Content-Disposition": `inline; filename="preview-protected-${targetVersion.versionNumber}.jpg"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (burnErr) {
      console.error("[Server Watermark Burning Failed, serving protected fallback]:", burnErr);
      const fallbackSvg = generateDemoWatermarkedSvg(deliverable.title, targetVersion.versionNumber);
      return new NextResponse(fallbackSvg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch (error: unknown) {
    console.error("[Review Asset Streaming Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to stream review asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
