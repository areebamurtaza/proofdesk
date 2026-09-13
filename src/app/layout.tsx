// filepath: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "@/app/globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProofDesk — Sovereign Escrow Proofing",
  description: "Zero-login proofing and automated escrow release for creative deliverables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#10b981", // Emerald accent matching ProofDesk
          colorBackground: "#09090b", // Obsidian black
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#09090b] text-zinc-100 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}