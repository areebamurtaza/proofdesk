// filepath: src/lib/agency.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * Helper to safely resolve Clerk Client across both SDK v4 (object) and v5 (callable Promise)
 */
async function resolveClerkClient() {
  if (typeof clerkClient === "function") {
    // Clerk v5+
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (clerkClient as unknown as () => Promise<any>)();
  }
  // Clerk v4
  return clerkClient;
}

/**
 * Resolves or dynamically provisions an Agency tenant in PostgreSQL.
 * - When an organization is active (e.g., evomultisales.org), it provisions/syncs that Organization.
 * - If no organization is selected, it provisions a personal agency workspace tied to the user's ID.
 */
export async function getOrCreateCurrentAgency() {
  const session = auth();
  const { userId, orgId, orgSlug } = session;

  if (!userId) {
    throw new Error("UNAUTHORIZED: No active authentication session found.");
  }

  // ============================================================================
  // CASE 1: Active Clerk B2B Organization Selected (e.g., evomultisales.org)
  // ============================================================================
  if (orgId) {
    // Fast-path: Return cached agency tenant if already provisioned
    const existingAgency = await prisma.agency.findUnique({
      where: { clerkOrgId: orgId },
    });
    if (existingAgency) {
      return existingAgency;
    }

    const client = await resolveClerkClient();
    let orgName = "Agency Workspace";
    let slug = orgSlug || `org-${orgId.toLowerCase()}`;

    try {
      const clerkOrg = await client.organizations.getOrganization({
        organizationId: orgId,
      });

      if (clerkOrg?.name) {
        orgName = clerkOrg.name;
      }
      if (clerkOrg?.slug) {
        slug = clerkOrg.slug;
      }
    } catch (error) {
      console.warn(
        "[Clerk] Could not retrieve organization metadata from API, using session tokens:",
        error
      );
    }

    // Upsert Agency in PostgreSQL matching the Clerk Org ID
    const agency = await prisma.agency.upsert({
      where: { clerkOrgId: orgId },
      update: {
        name: orgName,
        slug,
      },
      create: {
        clerkOrgId: orgId,
        name: orgName,
        slug,
      },
    });

    return agency;
  }

  // ============================================================================
  // CASE 2: Personal Studio Fallback (No Clerk Organization Selected)
  // ============================================================================
  const personalOrgId = `user_${userId}`;

  // Fast-path: Return personal agency if already provisioned
  const existingPersonalAgency = await prisma.agency.findUnique({
    where: { clerkOrgId: personalOrgId },
  });
  if (existingPersonalAgency) {
    return existingPersonalAgency;
  }

  const client = await resolveClerkClient();
  let personalName = "Personal Studio";

  try {
    const user = await client.users.getUser(userId);
    if (user.firstName) {
      personalName = `${user.firstName}'s Studio`;
    } else if (user.emailAddresses?.[0]?.emailAddress) {
      personalName = `${user.emailAddresses[0].emailAddress.split("@")[0]}'s Studio`;
    }
  } catch (error) {
    console.warn("[Clerk] Could not retrieve user metadata from API, using defaults:", error);
  }

  const personalSlug = `personal-${userId.toLowerCase()}`;

  const personalAgency = await prisma.agency.upsert({
    where: { clerkOrgId: personalOrgId },
    update: {
      name: personalName,
    },
    create: {
      clerkOrgId: personalOrgId,
      name: personalName,
      slug: personalSlug,
    },
  });

  return personalAgency;
}