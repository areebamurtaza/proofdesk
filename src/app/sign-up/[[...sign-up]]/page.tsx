// filepath: src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-950 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white text-base font-semibold",
            headerSubtitle: "text-zinc-400 text-xs",
            formButtonPrimary:
              "bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold normal-case shadow-none",
            formFieldInput:
              "bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500",
            footerActionLink: "text-emerald-400 hover:text-emerald-300 text-xs",
          },
        }}
      />
    </div>
  );
}