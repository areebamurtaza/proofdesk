// filepath: src/app/api/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateCurrentAgency } from "@/lib/agency";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const agency = await getOrCreateCurrentAgency();
    const { searchParams } = new URL(req.url);
    const actionFilter = searchParams.get("action");

    const whereClause: Record<string, unknown> = {
      deliverable: {
        project: {
          agencyId: agency.id,
        },
      },
    };

    if (actionFilter && actionFilter !== "ALL") {
      whereClause.action = actionFilter;
    }

    const rawLogs = await prisma.reviewAccessLog.findMany({
      where: whereClause,
      orderBy: { accessedAt: "desc" },
      take: 100,
      include: {
        deliverable: {
          select: {
            id: true,
            title: true,
            reviewToken: true,
            status: true,
            isUnlocked: true,
            project: {
              select: {
                id: true,
                name: true,
                clientName: true,
                clientEmail: true,
              },
            },
          },
        },
      },
    });

    const logs = rawLogs.map((log) => ({
      id: log.id,
      action: (log as { action?: string }).action || "VIEW_PORTAL",
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      accessedAt: log.accessedAt.toISOString(),
      deliverable: {
        id: log.deliverable.id,
        title: log.deliverable.title,
        reviewToken: log.deliverable.reviewToken,
        status: log.deliverable.status,
        isUnlocked: log.deliverable.isUnlocked,
        projectName: log.deliverable.project.name,
        clientName: log.deliverable.project.clientName,
        clientEmail: log.deliverable.project.clientEmail,
      },
    }));

    // Aggregate summary metrics
    const stats = {
      totalViews: logs.filter((l) => l.action === "VIEW_PORTAL").length,
      totalPins: logs.filter((l) => l.action === "DROP_PIN").length,
      totalDownloads: logs.filter((l) => l.action === "DOWNLOAD_MASTER").length,
      totalApprovals: logs.filter((l) => l.action === "APPROVE_DELIVERABLE").length,
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        totalEvents: logs.length,
        logs,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: unknown) {
    console.error("[Global Activity Route Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve workspace activity.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}