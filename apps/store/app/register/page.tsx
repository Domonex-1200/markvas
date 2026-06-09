import { Suspense } from "react";
import { RegisterForm } from "../../src/components/RegisterForm";

export default function RegisterPage(): JSX.Element {
  return (
    <main className="hero-dark flex min-h-screen items-center justify-center px-6 py-16">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
