import { Suspense } from "react";
import { LoginForm } from "../../src/components/LoginForm";

export default function LoginPage(): JSX.Element {
  return (
    <main className="hero-dark flex min-h-screen items-center justify-center px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
