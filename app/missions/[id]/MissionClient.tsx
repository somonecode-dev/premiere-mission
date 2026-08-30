"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mission = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  expectations: string;
  duration: string;
  level: string;
  category: string;
  status: "Active" | "Inactive";
};

export default function MissionClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const id = params.id as string;

  const fromCandidate =
    searchParams.get("from") === "candidat";

  const [mission, setMission] = useState<Mission | null>(null);
  const [organizationName, setOrganizationName] =
    useState("Une organisation");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMission() {
      setLoading(true);

      const { data, error } = await supabase
        .from("missions")
        .select(
          `
            id,
            organization_id,
            title,
            description,
            expectations,
            duration_days,
            level,
            domain,
            is_active
          `
        )
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Erreur lors du chargement de la mission :",
          error
        );
        setMission(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setMission(null);
        setLoading(false);
        return;
      }

      const { data: organizationData, error: organizationError } =
        await supabase
          .from("organizations")
          .select("name")
          .eq("id", data.organization_id)
          .maybeSingle();

      if (organizationError) {
        console.error(
          "Erreur lors du chargement de l'organisation :",
          organizationError
        );
      }

      setOrganizationName(
        organizationData?.name?.trim() ||
          "Une organisation"
      );

      setMission({
        id: data.id,
        organization_id: data.organization_id,
        title: data.title,
        description: data.description ?? "",
        expectations: data.expectations ?? "",
        duration: formatDuration(data.duration_days),
        level: data.level ?? "",
        category: data.domain ?? "",
        status: data.is_active ? "Active" : "Inactive",
      });

      setLoading(false);
    }

    loadMission();
  }, [id, supabase]);

  const missionsUrl = fromCandidate
    ? "/missions?from=candidat"
    : "/missions";

  const candidatureUrl = fromCandidate
    ? `/missions/${id}/candidature?from=candidat`
    : `/missions/${id}/candidature`;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement de la mission...
        </p>
      </main>
    );
  }

  if (!mission) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">🔎</div>

          <h1 className="mt-5 text-2xl font-bold">
            Mission introuvable
          </h1>

          <p className="mt-3 text-slate-500">
            Cette mission n'existe plus ou n'est pas disponible.
          </p>

          <Link
            href={missionsUrl}
            className="mt-7 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            ← Retour aux missions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <Link
              href={missionsUrl}
              className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              ← Retour aux missions
            </Link>

            <h1 className="mt-3 text-2xl font-bold">
              Détail de la mission
            </h1>
          </div>
        </div>
      </header>

      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
                  {mission.title}
                </h2>

                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {mission.description}
                </p>
              </div>

              <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold">
                  Ce qui est attendu
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {mission.expectations}
                </p>
              </div>
            </div>

            <aside>
              <div className="sticky top-6 rounded-3xl bg-white p-7 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Mission proposée par
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {organizationName}
                </h3>

                <div className="my-6 border-t border-slate-200" />

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-500">
                      Durée
                    </p>

                    <p className="mt-1 font-semibold">
                      {mission.duration}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Niveau
                    </p>

                    <p className="mt-1 font-semibold">
                      {mission.level}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Domaine
                    </p>

                    <p className="mt-1 font-semibold">
                      {mission.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Statut
                    </p>

                    <p className="mt-1 font-semibold text-emerald-600">
                      {mission.status}
                    </p>
                  </div>
                </div>

                <Link
                  href={candidatureUrl}
                  className="mt-8 block w-full rounded-xl bg-emerald-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-emerald-700"
                >
                  Postuler à cette mission →
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Tu peux envoyer ta candidature directement pour cette
                  mission.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDuration(days: number | null) {
  if (!days) {
    return "Durée non précisée";
  }

  return `${days} jour${days > 1 ? "s" : ""}`;
}