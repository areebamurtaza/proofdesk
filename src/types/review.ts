// filepath: src/types/review.ts

export type FileType =
  | "PDF"
  | "PNG"
  | "JPG"
  | "SVG"
  | "FIGMA"
  | "ILLUSTRATOR"
  | "CANVA"
  | "ZIP";

export type DeliverableStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PAYMENT_PENDING"
  | "COMPLETED";

export type CommentAuthorType = "AGENCY" | "CLIENT";

export interface CommentItem {
  id: string;
  versionId: string;
  authorType: CommentAuthorType;
  authorName: string;
  authorEmail?: string;
  content: string;
  xPercent: number; // Normalized: 0.0 to 1.0
  yPercent: number; // Normalized: 0.0 to 1.0
  isResolved: boolean;
  createdAt: string;
}

export interface VersionItem {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  previewUrl: string;
  fallbackPreviewUrl?: string;
  cleanDownloadUrl?: string | null;
  width: number;
  height: number;
  changeLog?: string;
  createdAt: string;
  comments: CommentItem[];
}

export interface DeliverableReviewData {
  id: string;
  title: string;
  description?: string | null;
  fileType: FileType;
  status: DeliverableStatus;
  isUnlocked: boolean;
  reviewToken: string;
  projectName: string;
  agencyName: string;
  invoiceAmountCents: number;
  currency: string;
  versions: VersionItem[];
}

export const MOCK_DELIVERABLE: DeliverableReviewData = {
  id: "deliv-88219-mock",
  title: "Aura Brand Identity — Digital Design System",
  description:
    "Final vector master guidelines and production screens. Leave pinned feedback directly on canvas or approve to trigger escrow release.",
  fileType: "PNG",
  status: "IN_REVIEW",
  isUnlocked: false,
  reviewToken: "demo-token",
  projectName: "Aura Global Rebrand 2026",
  agencyName: "Studio Monolith",
  invoiceAmountCents: 150000,
  currency: "usd",
  versions: [
    {
      id: "ver-1",
      versionNumber: 1,
      fileName: "aura_system_v1.png",
      fileSize: 3450000,
      mimeType: "image/png",
      previewUrl: "/api/review/demo-token/asset?version=1",
      width: 1600,
      height: 1000,
      changeLog: "Initial draft export from Figma",
      createdAt: "2026-09-01T10:00:00Z",
      comments: [
        {
          id: "comm-1",
          versionId: "ver-1",
          authorType: "CLIENT",
          authorName: "Sarah Jenkins",
          authorEmail: "sarah@auracore.io",
          content: "Can we enhance the contrast on the secondary navigation label?",
          xPercent: 0.28,
          yPercent: 0.38,
          isResolved: false,
          createdAt: "2026-09-01T14:30:00Z",
        },
      ],
    },
    {
      id: "ver-2",
      versionNumber: 2,
      fileName: "aura_system_v2.png",
      fileSize: 3820000,
      mimeType: "image/png",
      previewUrl: "/api/review/demo-token/asset?version=2",
      width: 1600,
      height: 1000,
      changeLog: "Contrast boosted by 30% and color values mapped to WCAG AAA standard.",
      createdAt: "2026-09-02T16:00:00Z",
      comments: [
        {
          id: "comm-2",
          versionId: "ver-2",
          authorType: "AGENCY",
          authorName: "Design Lead",
          content: "Contrast boosted by 30% and color values mapped to WCAG AAA standard.",
          xPercent: 0.28,
          yPercent: 0.38,
          isResolved: true,
          createdAt: "2026-09-02T16:15:00Z",
        },
        {
          id: "comm-3",
          versionId: "ver-2",
          authorType: "CLIENT",
          authorName: "Sarah Jenkins",
          authorEmail: "sarah@auracore.io",
          content: "The contrast is sharp now. Approved from our side!",
          xPercent: 0.65,
          yPercent: 0.22,
          isResolved: false,
          createdAt: "2026-09-02T18:00:00Z",
        },
      ],
    },
  ],
};