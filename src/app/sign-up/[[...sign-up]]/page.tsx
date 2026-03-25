import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-warm">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-surface-raised border border-border",
          },
        }}
      />
    </div>
  );
}
