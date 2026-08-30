"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileMenu from "@/app/components/ProfileMenu";
import { createClient } from "@/lib/supabase/client";

type CandidatureStatus =
  | "Nouvelle"
  | "En cours"
  | "Retenue"
  | "Refusée";

type Candidature = {
  id: string;
  missionId: string;
  missionTitle: string;
  name: string;
  email: string;
  motivation: string;
  status: CandidatureStatus;
  createdAt: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function CandidaturesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCandidatures = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/connexion");
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
        .eq("candidate_id", user.id)
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

    const missionIds = Array.from(
      new Set(
        (applicationsData ?? []).map(
          (application) => application.mission_id
        )
      )
    );

    let missionsData: {
      id: string;
      title: string;
    }[] = [];

    if (missionIds.length > 0) {
      const { data, error: missionsError } = await supabase
        .from("missions")
        .select("id, title")
        .in("id", missionIds);

      if (missionsError) {
        console.error(
          "Erreur lors du chargement des missions :",
          missionsError
        );
      } else {
        missionsData = data ?? [];
      }
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Erreur lors du chargement du profil :",
        profileError
      );
    }

    const missionMap = new Map(
      missionsData.map((mission) => [
        mission.id,
        mission.title,
      ])
    );

    const fullName =
      profileData?.full_name ?? "Candidat";

    const mappedCandidatures: Candidature[] = (
      applicationsData ?? []
    ).map((application) => ({
      id: application.id,
      missionId: application.mission_id,
      missionTitle:
        missionMap.get(application.mission_id) ??
        "Mission inconnue",
      name: fullName,
      email: user.email ?? "",
      motivation: application.message ?? "",
      status: mapApplicationStatus(application.status),
      createdAt: application.created_at,
    }));

    setCandidatures(mappedCandidatures);
    setLoading(false);
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const getStatusClasses = (
    status: CandidatureStatus
  ) => {
    switch (status) {
      case "Retenue":
        return "bg-emerald-50 text-emerald-700";

      case "Refusée":
        return "bg-red-50 text-red-700";

      case "En cours":
        return "bg-blue-50 text-blue-700";

      case "Nouvelle":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const getStatusLabel = (
    status: CandidatureStatus
  ) => {
    switch (status) {
      case "Retenue":
        return "Retenue";

      case "Refusée":
        return "Refusée";

      case "En cours":
        return "En cours";

      case "Nouvelle":
      default:
        return "Nouvelle";
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/connexion");
      return;
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", deleteId)
      .eq("candidate_id", user.id);

    if (error) {
      console.error(
        "Erreur lors de la suppression de la candidature :",
        error
      );
      return;
    }

    setSelectedId(null);
    setDeleteId(null);

    await loadCandidatures();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement de tes candidatures...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Espace candidat
            </p>

            <ProfileMenu />
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mes candidatures
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Suis l'évolution de tes candidatures.
          </p>
        </div>
      </header>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <p className="text-sm font-medium text-slate-500">
                Candidatures
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {candidatures.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <p className="text-sm font-medium text-slate-500">
                En cours
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {
                  candidatures.filter(
                    (candidature) =>
                      candidature.status === "En cours"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <p className="text-sm font-medium text-slate-500">
                Retenues
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {
                  candidatures.filter(
                    (candidature) =>
                      candidature.status === "Retenue"
                  ).length
                }
              </p>
            </div>
          </div>
          
              <Link
                href="/missions?from=candidat"
                className="mt-5 mb-5 inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                Voir d'autres missions
              </Link>

          {candidatures.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
                📄
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Aucune candidature pour le moment
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Lorsque tu postuleras à une mission, ta candidature
                apparaîtra automatiquement ici.
              </p>

              <Link
                href="/missions?from=candidat"
                className="mt-8 inline-flex rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white transition hover:bg-emerald-700"
              >
                Découvrir les missions →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {candidatures.map((candidature) => {
                const isSelected =
                  selectedId === candidature.id;

                return (
                  <article
                    key={candidature.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="p-7 md:p-8">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                              Candidature
                            </span>

                            <span
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                                candidature.status
                              )}`}
                            >
                              {getStatusLabel(
                                candidature.status
                              )}
                            </span>
                          </div>

                          <h2 className="mt-5 text-2xl font-bold text-slate-900">
                            {candidature.missionTitle}
                          </h2>

                          <p className="mt-2 text-slate-500">
                            Candidature envoyée le{" "}
                            {formatDate(
                              candidature.createdAt
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedId(
                              isSelected
                                ? null
                                : candidature.id
                            )
                          }
                          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
                        >
                          {isSelected
                            ? "Masquer les détails"
                            : "Consulter"}
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="border-t border-slate-200 bg-slate-50 p-7 md:p-8">
                        <div className="grid gap-8 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Nom complet
                            </p>

                            <p className="mt-2 font-semibold text-slate-900">
                              {candidature.name}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Adresse email
                            </p>

                            <p className="mt-2 font-semibold text-slate-900">
                              {candidature.email}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Mission
                            </p>

                            <p className="mt-2 font-semibold text-slate-900">
                              {candidature.missionTitle}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Statut actuel
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                                candidature.status
                              )}`}
                            >
                              {getStatusLabel(
                                candidature.status
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-8 border-t border-slate-200 pt-8">
                          <p className="text-sm font-medium text-slate-500">
                            Ta motivation
                          </p>

                          <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                            {candidature.motivation}
                          </p>
                        </div>

                        <div className="mt-8 flex justify-end border-t border-slate-200 pt-8">
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(candidature.id)
                            }
                            className="rounded-xl border border-red-200 bg-white px-6 py-3 font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                          >
                            Supprimer ma candidature
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6"
          onClick={() => setDeleteId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2
              id="delete-title"
              className="mt-5 text-2xl font-bold text-slate-900"
            >
              Supprimer cette candidature ?
            </h2>

            <p className="mt-3 leading-6 text-slate-600">
              Cette action est définitive. Ta candidature sera
              supprimée de ton espace.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function mapApplicationStatus(
  status: string | null
): CandidatureStatus {
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