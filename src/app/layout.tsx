import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@/app/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

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
        variables: {
          colorPrimary: "#172B4D", // Primary Navy
          colorBackground: "#FFFFFF",
          colorText: "#171A1F",
          colorInputBackground: "#F8F6F1",
          colorInputText: "#171A1F",
        },
        elements: {
          card: "bg-white border border-[#DDD8CF] shadow-xl rounded-2xl",
          formButtonPrimary:
            "bg-[#172B4D] hover:bg-[#0B1628] text-white text-xs font-semibold shadow-md",
          headerTitle: "text-[#171A1F] font-bold text-lg",
          headerSubtitle: "text-[#667085] text-xs",
          formFieldLabel: "text-[#171A1F] text-xs font-medium",
          formFieldInput:
            "bg-[#F8F6F1] border-[#DDD8CF] text-[#171A1F] text-xs rounded-xl focus:border-[#172B4D]",
          footerActionLink: "text-[#172B4D] hover:text-[#0B1628] font-semibold text-xs",
        },
      }}
    >
      <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable}`}>
        <body className="font-sans bg-[#F8F6F1] text-[#171A1F] antialiased selection:bg-[#D7C3A5]/40 selection:text-[#0B1628]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}