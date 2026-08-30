import { Suspense } from "react";
import MissionClient from "./MissionClient";

export default function MissionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">
            Chargement de la mission...
          </p>
        </main>
      }
    >
      <MissionClient />
    </Suspense>
  );
}