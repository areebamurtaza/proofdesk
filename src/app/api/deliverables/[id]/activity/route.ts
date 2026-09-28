// filepath: src/app/api/deliverables/[id]/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    let agency;
    try {
      agency = await getOrCreateCurrentAgency();
    } catch {
      return NextResponse.json(
        { error: "Unauthorized. Active agency session required." },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Deliverable ID is required." },
        { status: 400 }
      );
    }

    // Verify deliverable ownership within this agency workspace
    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id,
        project: {
          agencyId: agency.id,
        },
      },
      select: { id: true },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable record not found or access denied." },
        { status: 404 }
      );
    }

    // Fetch the audit telemetry trail for this specific deliverable
    const logs = await prisma.reviewAccessLog.findMany({
      where: { deliverableId: id },
      orderBy: { accessedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(
      {
        success: true,
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action || "VIEW_PORTAL",
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          accessedAt: log.accessedAt.toISOString(),
        })),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: unknown) {
    console.error("[Deliverable Activity Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load activity logs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
