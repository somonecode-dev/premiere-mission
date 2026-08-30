"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileMenu from "@/app/components/ProfileMenu";
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

type Organization = {
  id: string;
  name: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function OrganisationPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [missionToDelete, setMissionToDelete] =
    useState<Mission | null>(null);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();

    if (organizationError) {
      console.error(
        "Erreur lors du chargement de l'organisation :",
        organizationError
      );
      setLoading(false);
      return;
    }

    if (!organizationData) {
      setOrganization(null);
      setMissions([]);
      setCandidatures([]);
      setLoading(false);
      return;
    }

    setOrganization(organizationData);
    console.log("ORGANIZATION DATA :", organizationData);

    const { data: missionsData, error: missionsError } =
      await supabase
        .from("missions")
        .select(
          `
            id,
            title,
            description,
            expectations,
            duration_days,
            level,
            domain,
            is_active,
            created_at
          `
        )
        .eq("organization_id", organizationData.id)
        .order("created_at", { ascending: false });
    console.log("MISSIONS DATA :", missionsData);
    console.log("MISSIONS ERROR :", missionsError);

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

    const mappedMissions: Mission[] = (missionsData ?? []).map(
      (mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description ?? "",
        expectations: mission.expectations ?? "",
        duration: formatDuration(mission.duration_days),
        level: mission.level ?? "",
        category: mission.domain ?? "",
        status: mission.is_active ? "Active" : "Inactive",
      })
    );

    setMissions(mappedMissions);

    const missionIds = (missionsData ?? []).map(
      (mission) => mission.id
    );

    if (missionIds.length === 0) {
      setCandidatures([]);
      setLoading(false);
      return;
    }

    const { data: applicationsData, error: applicationsError } =
      await supabase
        .from("applications")
        .select(
          `
            id,
            mission_id,
            candidate_id,
            message,
            status,
            created_at
          `
        )
        .in("mission_id", missionIds)
        .order("created_at", { ascending: false });

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
      const { data, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
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
      profilesData.map((profile) => [profile.id, profile])
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
      const profile = profilesMap.get(application.candidate_id);

      return {
        id: application.id,
        missionId: application.mission_id,
        missionTitle:
          missionMap.get(application.mission_id) ??
          "Mission inconnue",
        name: profile?.full_name ?? "Candidat",
        email: "Email non disponible",
        motivation: application.message ?? "",
        status: mapApplicationStatus(application.status),
        createdAt: application.created_at,
      };
    });

    setCandidatures(mappedCandidatures);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeMissions = missions.filter(
    (mission) => mission.status === "Active"
  ).length;

  const profiles = new Set(
    candidatures.map((candidature) => candidature.name)
  ).size;

  const recentCandidatures = [...candidatures]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const handleDeleteMission = async () => {
    if (!missionToDelete) {
      return;
    }

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
        "Impossible de retrouver l'organisation."
      );
      return;
    }

    const { error } = await supabase
      .from("missions")
      .delete()
      .eq("id", missionToDelete.id)
      .eq("organization_id", organizationData.id);

    if (error) {
      console.error(
        "Erreur lors de la suppression de la mission :",
        error
      );
      return;
    }

    setMissionToDelete(null);
    await loadData();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement du tableau de bord...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-emerald-600">
              Espace organisation
            </p>

            <ProfileMenu />
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {organization?.name ?? "Association locale"}
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-4xl font-bold text-slate-900">
          Tableau de bord
        </h2>

        <p className="mt-3 text-xl text-slate-600">
          Suivez vos missions et les candidatures reçues.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4 text-center">
          <StatCard
            title="Missions publiées"
            value={missions.length}
            subtitle="Depuis le lancement"
          />

          <StatCard
            title="Candidatures reçues"
            value={candidatures.length}
            subtitle="Toutes les candidatures"
          />

          <StatCard
            title="Missions actives"
            value={activeMissions}
            subtitle="En cours actuellement"
          />

          <StatCard
            title="Profils rencontrés"
            value={profiles}
            subtitle="Profils uniques"
          />
        </div>

        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Vos missions
              </h2>

              <p className="mt-2 text-lg text-slate-600">
                Retrouvez ici les missions proposées par votre
                organisation.
              </p>
            </div>

            <button
              onClick={() => router.push("/proposer-mission")}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              + Proposer une mission
            </button>
          </div>

          {missions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-4xl">📋</div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Aucune mission publiée
              </h3>

              <p className="mt-2 text-slate-500">
                Commencez par proposer une mission.
              </p>

              <button
                onClick={() => router.push("/proposer-mission")}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
              >
                Proposer une mission
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {missions.map((mission) => {
                const count = candidatures.filter(
                  (candidature) =>
                    candidature.missionId === mission.id
                ).length;

                return (
                  <article
                    key={mission.id}
                    className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                  >
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                            {mission.category}
                          </span>

                          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                            {mission.status}
                          </span>
                        </div>

                        <h3 className="mt-5 break-words text-2xl font-bold text-slate-900">
                          {mission.title}
                        </h3>

                        <p className="mt-3 text-slate-600">
                          Niveau : {mission.level} · {count} candidature
                          {count > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-nowrap">
                        <button
                          onClick={() =>
                            router.push(
                              `/organisation/missions/${mission.id}`
                            )
                          }
                          className="w-full min-w-[190px] rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                        >
                          Voir la mission
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/organisation/candidatures?mission=${mission.id}`
                            )
                          }
                          className="w-full min-w-[220px] rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                        >
                          Voir les candidatures
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMissionToDelete(mission)
                          }
                          className="w-full min-w-[150px] rounded-xl border border-red-200 bg-white px-6 py-4 font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-bold text-slate-900">
            Candidatures récentes
          </h2>

          <p className="mt-2 text-lg text-slate-600">
            Les dernières personnes ayant postulé à vos missions.
          </p>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {recentCandidatures.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Aucune candidature pour le moment.
              </div>
            ) : (
              recentCandidatures.map((candidature) => (
                <div
                  key={candidature.id}
                  className="flex flex-col gap-5 border-b border-slate-100 p-6 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-700">
                      {getInitials(candidature.name)}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {candidature.name}
                      </h3>

                      <p className="mt-1 text-slate-600">
                        Candidature pour :{" "}
                        {candidature.missionTitle}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Statut : {candidature.status}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/organisation/candidatures/${candidature.id}`
                      )
                    }
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Consulter
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      {missionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-mission-title"
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2
              id="delete-mission-title"
              className="mt-6 text-2xl font-bold text-slate-900"
            >
              Supprimer cette mission ?
            </h2>

            <p className="mt-3 text-slate-600">
              Vous êtes sur le point de supprimer :
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              « {missionToDelete.title} »
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Cette action est irréversible.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMissionToDelete(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDeleteMission}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <p className="text-lg text-slate-600">{title}</p>

      <p className="mt-5 text-5xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-4 font-medium text-emerald-600">
        {subtitle}
      </p>
    </div>
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