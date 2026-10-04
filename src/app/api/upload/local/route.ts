// filepath: src/app/api/upload/local/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";

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

    // SECURITY ENFORCEMENT: Clean master assets are locked in escrow until payment settles!
    const isCleanKey = key.startsWith("clean-") || key.includes("/clean/");
    if (isCleanKey) {
      const reviewToken = searchParams.get("token") || request.headers.get("x-review-token");
      let isAuthorized = false;

      // 1. Authorized via unlocked review token
      if (reviewToken) {
        const deliverable = await prisma.deliverable.findUnique({
          where: { reviewToken },
          select: {
            isUnlocked: true,
            versions: {
              where: { cleanFileKey: key },
              select: { id: true },
            },
          },
        });

        if (deliverable && deliverable.isUnlocked && deliverable.versions.length > 0) {
          isAuthorized = true;
        }
      }

      // 2. Authorized via authenticated agency session
      if (!isAuthorized) {
        try {
          const agency = await getOrCreateCurrentAgency();
          if (agency) {
            const versionOwnership = await prisma.version.findFirst({
              where: {
                cleanFileKey: key,
                deliverable: {
                  project: {
                    agencyId: agency.id,
                  },
                },
              },
              select: { id: true },
            });

            if (versionOwnership) {
              isAuthorized = true;
            }
          }
        } catch {
          // No active agency session
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          {
            error:
              "Access Denied: Clean master assets remain locked in escrow until client signs and invoice settles.",
          },
          { status: 403 }
        );
      }
    }

    // Built-in Demo Watermarked Assets: Always serve watermarked SVG responses
    if (key === "preview-demo-v1.svg" || key === "preview-demo-v2.svg") {
      const versionNum = key === "preview-demo-v2.svg" ? 2 : 1;
      const svgContent = generateDemoWatermarkedSvg(versionNum);
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      });
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

function generateDemoWatermarkedSvg(version: number): string {
  const isV1 = version === 1;
  const title = isV1 ? "AURA DIGITAL DESIGN SYSTEM • V1" : "AURA SPATIAL IDENTITY MASTER • V2";
  const subtitle = isV1 ? "EXPLORATORY GEOMETRY & TYPOGRAPHY" : "CALIBRATED CONTRAST & WCAG AAA COMPLIANT";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(215,195,165,0.08)" stroke-width="1"/>
      </pattern>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B1628"/>
        <stop offset="50%" stop-color="#121F38"/>
        <stop offset="100%" stop-color="#070E1A"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D7C3A5"/>
        <stop offset="100%" stop-color="#E2D4C0"/>
      </linearGradient>
    </defs>

    <rect width="1600" height="1000" fill="url(#bg)"/>
    <rect width="1600" height="1000" fill="url(#grid)"/>

    <g transform="translate(800, 400)">
      <circle r="200" fill="none" stroke="rgba(215,195,165,0.2)" stroke-dasharray="6,4" stroke-width="1.5"/>
      <circle r="140" fill="none" stroke="rgba(56,189,248,0.25)" stroke-dasharray="4,4" stroke-width="1.5"/>
      <polygon points="0,-110 95,55 -95,55" fill="none" stroke="url(#accent)" stroke-width="4"/>
      <polygon points="0,-55 48,28 -48,28" fill="none" stroke="#29466F" stroke-width="3"/>
      <circle cx="0" cy="0" r="14" fill="#D7C3A5"/>
    </g>

    <text x="800" y="650" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#FFFFFF" letter-spacing="8">${title}</text>
    <text x="800" y="700" text-anchor="middle" font-family="monospace" font-size="16" fill="#D7C3A5" letter-spacing="3">${subtitle}</text>
    <text x="800" y="735" text-anchor="middle" font-family="sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">300 DPI LOSSLESS VECTOR MASTER &bull; RGB / CMYK</text>

    <!-- PERMANENT PIXEL-LEVEL WATERMARK (TILED DIAGONALS) -->
    <g transform="rotate(-28 800 500)" font-family="monospace" font-size="28" font-weight="bold" letter-spacing="4">
      <text x="-400" y="-200" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="-200" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-400" y="0" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="0" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-400" y="200" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="200" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-400" y="400" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="400" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-400" y="600" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="600" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="-400" y="800" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
      <text x="200" y="800" fill="rgba(255,255,255,0.25)" stroke="rgba(0,0,0,0.5)" stroke-width="2">PROOFDESK • UNPAID PREVIEW</text>
    </g>

    <!-- CENTRAL ESCROW SECURITY LOCK BANNER -->
    <rect x="0" y="475" width="1600" height="50" fill="rgba(11,22,40,0.92)" stroke="rgba(215,195,165,0.5)" stroke-width="1"/>
    <text x="800" y="506" text-anchor="middle" font-family="monospace" font-size="16" font-weight="bold" fill="#D7C3A5" letter-spacing="3">ESCROW LOCKED &bull; UNPAID DRAFT &bull; NOT AUTHORIZED FOR PRODUCTION</text>

    <!-- FOOTER CERTIFICATE -->
    <rect x="0" y="960" width="1600" height="40" fill="rgba(0,0,0,0.6)"/>
    <text x="30" y="985" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.6)">PROOFDESK ESCROW CUSTODY &bull; SHA-256 HASH: 7f9a84b2c1e8</text>
    <text x="1570" y="985" text-anchor="end" font-family="monospace" font-size="12" fill="#D7C3A5">PAYMENT REQUIRED FOR CLEAN MASTER ASSETS</text>
  </svg>`;
}