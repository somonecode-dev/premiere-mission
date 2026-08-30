import { Suspense } from "react";
import OrganisationCandidaturesClient from "./OrganisationCandidaturesClient";

export default function OrganisationCandidaturesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">
            Chargement des candidatures...
          </p>
        </main>
      }
    >
      <OrganisationCandidaturesClient />
    </Suspense>
  );
}