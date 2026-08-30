import { Suspense } from "react";
import ConnexionClient from "./ConnexionClient";

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">
            Chargement...
          </p>
        </main>
      }
    >
      <ConnexionClient />
    </Suspense>
  );
}