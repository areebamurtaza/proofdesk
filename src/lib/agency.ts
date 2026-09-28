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
 * - When an organization is requested or active, it provisions/syncs that Organization.
 * - If no organization is specified and user belongs to orgs, automatically resolves to their organization.
 * - If user explicitly requests personal or belongs to no orgs, provisions personal agency.
 */
export async function getOrCreateCurrentAgency(preferredOrgId?: string | null) {
  const session = auth();
  const { userId, orgId: sessionOrgId, orgSlug: sessionOrgSlug } = session;

  if (!userId) {
    throw new Error("UNAUTHORIZED: No active authentication session found.");
  }

  const client = await resolveClerkClient();
  let targetOrgId: string | null = null;
  let targetOrgSlug: string | undefined = sessionOrgSlug;

  // 1. If caller explicitly passed a preferredOrgId
  if (preferredOrgId) {
    if (preferredOrgId === "personal") {
      targetOrgId = null;
    } else if (preferredOrgId.startsWith("org_")) {
      targetOrgId = preferredOrgId;
    }
  } else if (sessionOrgId) {
    // 2. Fall back to active session orgId
    targetOrgId = sessionOrgId;
  } else {
    // 3. Neither provided: check if user has organization memberships in Clerk
    try {
      const memberships = await client.users.getOrganizationMembershipList({ userId });
      if (memberships?.data && memberships.data.length > 0) {
        // Automatically default to the user's primary organization
        targetOrgId = memberships.data[0].organization.id;
        targetOrgSlug = memberships.data[0].organization.slug;
      }
    } catch (err) {
      console.warn("[Clerk] Failed to query user organization memberships:", err);
    }
  }

  // ============================================================================
  // CASE 1: Active or Resolved Clerk Organization
  // ============================================================================
  if (targetOrgId) {
    // Fast-path: Return cached agency tenant if already provisioned
    const existingAgency = await prisma.agency.findUnique({
      where: { clerkOrgId: targetOrgId },
    });
    if (existingAgency) {
      return existingAgency;
    }

    let orgName = "Agency Workspace";
    let slug = targetOrgSlug || `org-${targetOrgId.toLowerCase()}`;

    try {
      const clerkOrg = await client.organizations.getOrganization({
        organizationId: targetOrgId,
      });

      if (clerkOrg?.name) {
        orgName = clerkOrg.name;
      }
      if (clerkOrg?.slug) {
        slug = clerkOrg.slug;
      }
    } catch (error) {
      console.warn(
        "[Clerk] Could not retrieve organization metadata from API, using defaults:",
        error
      );
    }

    // Upsert Agency in PostgreSQL matching the Clerk Org ID
    const agency = await prisma.agency.upsert({
      where: { clerkOrgId: targetOrgId },
      update: {
        name: orgName,
        slug,
      },
      create: {
        clerkOrgId: targetOrgId,
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

/**
 * Verifies whether the currently authenticated user has access to a specific deliverable.
 * - Access is granted if the deliverable's agency is personal (user_<userId>) OR
 * - The deliverable's agency is an organization (org_<orgId>) and the user is a member of that organization.
 */
export async function getVerifiedDeliverableAgency(
  deliverableId: string,
  requestedOrgId?: string | null
) {
  const session = auth();
  const { userId } = session;

  if (!userId) {
    throw new Error("UNAUTHORIZED: No active authentication session found.");
  }

  // 1. First, check if current active agency owns the deliverable
  const currentAgency = await getOrCreateCurrentAgency(requestedOrgId);

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: {
      project: {
        include: { agency: true },
      },
    },
  });

  if (!deliverable) {
    return null;
  }

  // 2. Direct match with current active agency
  if (deliverable.project.agencyId === currentAgency.id) {
    return { agency: currentAgency, deliverable };
  }

  // 3. Check if user owns the personal agency that created this deliverable
  const ownerClerkOrgId = deliverable.project.agency.clerkOrgId;
  if (ownerClerkOrgId === `user_${userId}`) {
    return { agency: deliverable.project.agency, deliverable };
  }

  // 4. Check if user is a member of the organization that owns this deliverable
  if (ownerClerkOrgId.startsWith("org_")) {
    const client = await resolveClerkClient();
    try {
      const memberships = await client.users.getOrganizationMembershipList({ userId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isMember = memberships?.data?.some(
        (m: { organization: { id: string } }) => m.organization.id === ownerClerkOrgId
      );
      if (isMember) {
        return { agency: deliverable.project.agency, deliverable };
      }
    } catch (err) {
      console.warn("[Clerk] Failed to verify organization membership for deliverable access:", err);
    }
  }

  return null;
}