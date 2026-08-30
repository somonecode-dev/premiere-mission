"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mission = {
  id: string;
  title: string;
  description: string;
  expectations: string;
  duration: string;
  level: string;
  category: string;
  status: "Active" | "Inactive";
};

type Candidature = {
  id: string;
  missionId: string;
  missionTitle: string;
  name: string;
  email: string;
  motivation: string;
  status: "Nouvelle" | "En cours" | "Retenue" | "Refusée";
  createdAt: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default function OrganisationCandidaturesClient() {
  return (
    <Suspense fallback={null}>
      <OrganisationCandidaturesContent />
    </Suspense>
  );
}

function OrganisationCandidaturesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const missionId = searchParams.get("mission");

  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      const { data: organizationData, error: organizationError } =
        await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

      if (organizationError || !organizationData) {
        console.error(
          "Organisation introuvable :",
          organizationError
        );

        setMissions([]);
        setCandidatures([]);
        setLoading(false);
        return;
      }

      const { data: missionsData, error: missionsError } =
        await supabase
          .from("missions")
          .select(`
            id,
            title,
            description,
            expectations,
            duration_days,
            level,
            domain,
            is_active,
            created_at
          `)
          .eq("organization_id", organizationData.id)
          .order("created_at", { ascending: false });

      if (missionsError) {
        console.error(
          "Erreur lors du chargement des missions :",
          missionsError
        );
        setMissions([]);
        setCandidatures([]);
        setLoading(false);
        return;
      }

      const mappedMissions: Mission[] = (
        missionsData ?? []
      ).map((mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description ?? "",
        expectations: mission.expectations ?? "",
        duration: formatDuration(mission.duration_days),
        level: mission.level ?? "",
        category: mission.domain ?? "",
        status: mission.is_active ? "Active" : "Inactive",
      }));

      setMissions(mappedMissions);

      const missionIds = (missionsData ?? []).map(
        (mission) => mission.id
      );

      if (missionIds.length === 0) {
        setCandidatures([]);
        setLoading(false);
        return;
      }

      let applicationQuery = supabase
        .from("applications")
        .select(`
          id,
          mission_id,
          candidate_id,
          message,
          status,
          created_at
        `)
        .in("mission_id", missionIds)
        .order("created_at", { ascending: false });

      if (missionId) {
        applicationQuery = applicationQuery.eq(
          "mission_id",
          missionId
        );
      }

      const {
        data: applicationsData,
        error: applicationsError,
      } = await applicationQuery;

      if (applicationsError) {
        console.error(
          "Erreur lors du chargement des candidatures :",
          applicationsError
        );

        setCandidatures([]);
        setLoading(false);
        return;
      }

      const candidateIds = Array.from(
        new Set(
          (applicationsData ?? []).map(
            (application) => application.candidate_id
          )
        )
      );

      let profilesData: Profile[] = [];

      if (candidateIds.length > 0) {
        const { data, error: profilesError } =
          await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", candidateIds);

        if (profilesError) {
          console.error(
            "Erreur lors du chargement des profils candidats :",
            profilesError
          );
        } else {
          profilesData = data ?? [];
        }
      }

      const profilesMap = new Map(
        profilesData.map((profile) => [
          profile.id,
          profile,
        ])
      );

      const missionMap = new Map(
        (missionsData ?? []).map((mission) => [
          mission.id,
          mission.title,
        ])
      );

      const mappedCandidatures: Candidature[] = (
        applicationsData ?? []
      ).map((application) => {
        const profile = profilesMap.get(
          application.candidate_id
        );

        return {
          id: application.id,
          missionId: application.mission_id,
          missionTitle:
            missionMap.get(application.mission_id) ??
            "Mission inconnue",
          name: profile?.full_name ?? "Candidat",
          email:
            profile?.email ??
            "Email non disponible",
          motivation: application.message ?? "",
          status: mapApplicationStatus(
            application.status
          ),
          createdAt: application.created_at,
        };
      });

      setCandidatures(mappedCandidatures);
      setLoading(false);
    }

    loadData();
  }, [missionId, router, supabase]);

  const mission = missions.find(
    (item) => item.id === missionId
  );

  const filteredCandidatures = missionId
    ? candidatures.filter(
        (candidature) =>
          candidature.missionId === missionId
      )
    : candidatures;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement des candidatures...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-slate-900">
                Candidatures reçues
              </h1>

              <p className="mt-2 text-lg text-slate-600">
                Consultez les personnes ayant postulé pour cette
                mission.
              </p>
            </div>

            <button
              onClick={() =>
                router.push("/organisation")
              }
              className="order-first shrink-0 self-start whitespace-nowrap text-sm font-medium text-slate-500 transition hover:text-emerald-600 lg:order-none"
            >
              ← Retour au dashboard
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-bold text-slate-900">
                {mission
                  ? mission.title
                  : "Toutes les candidatures"}
              </h2>

              <p className="mt-3 text-lg text-slate-600">
                {filteredCandidatures.length} candidature
                {filteredCandidatures.length > 1 ? "s" : ""} reçue
                {filteredCandidatures.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {missionId && !mission ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
              🔎
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Mission introuvable
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
              Cette mission n'existe plus ou n'est plus disponible.
            </p>

            <button
              onClick={() =>
                router.push("/organisation")
              }
              className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
            >
              Retour au dashboard
            </button>
          </div>
        ) : filteredCandidatures.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📭
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Aucune candidature
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
              Aucune personne n'a encore postulé à cette mission.
            </p>

            <button
              onClick={() =>
                router.push("/organisation")
              }
              className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
            >
              Retour au dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredCandidatures.map((candidature) => (
              <article
                key={candidature.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-base sm:text-lg font-bold text-emerald-700">
                      {getInitials(candidature.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                        {candidature.name}
                      </h3>

                      <p className="mt-1 text-sm sm:text-base text-slate-600 break-all">
                        {candidature.email}
                      </p>

                      <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                        Candidature envoyée le{" "}
                        {formatDate(candidature.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:flex-row sm:items-center">
                    <span
                      className={`rounded-full px-4 py-2 font-semibold ${
                        candidature.status === "Retenue"
                          ? "bg-emerald-50 text-emerald-700"
                          : candidature.status === "Refusée"
                          ? "bg-slate-100 text-slate-700"
                          : candidature.status === "En cours"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {candidature.status}
                    </span>

                    <button
                      onClick={() =>
                        router.push(
                          `/organisation/candidatures/mission/${candidature.id}`
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Consulter
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(days: number | null) {
  if (!days) {
    return "Durée non précisée";
  }

  return `${days} jour${days > 1 ? "s" : ""}`;
}

function mapApplicationStatus(
  status: string | null
): Candidature["status"] {
  switch (status) {
    case "accepted":
    case "Retenue":
      return "Retenue";

    case "rejected":
    case "Refusée":
      return "Refusée";

    case "reviewing":
    case "in_review":
    case "En cours":
      return "En cours";

    case "submitted":
    case "Nouvelle":
    default:
      return "Nouvelle";
  }
}