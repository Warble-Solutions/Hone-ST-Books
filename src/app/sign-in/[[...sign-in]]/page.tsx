import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-surface border border-white/10",
          },
        }}
      />
    </div>
  );
}
