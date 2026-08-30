import { Suspense } from "react";
import MissionsClient from "./MissionsClient";

export default function MissionsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">
            Chargement des missions...
          </p>
        </main>
      }
    >
      <MissionsClient />
    </Suspense>
  );
}