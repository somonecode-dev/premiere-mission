"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus =
  | "Nouvelle"
  | "En cours"
  | "Retenue"
  | "Refusée";

type Candidature = {
  id: string;
  name: string;
  email: string;
  mission_id: string;
  mission_title: string;
  motivation: string;
  status: ApplicationStatus;
};

export default function CandidatureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [candidature, setCandidature] =
    useState<Candidature | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCandidature() {
      setLoading(true);
      setErrorMessage("");

      const id = String(params.id);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
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
          "Erreur lors de la récupération de l'organisation :",
          organizationError
        );
        setCandidature(null);
        setLoading(false);
        return;
      }

      const { data: applicationData, error: applicationError } =
        await supabase
          .from("applications")
          .select(`
            id,
            mission_id,
            candidate_id,
            message,
            status
          `)
          .eq("id", id)
          .maybeSingle();

      if (applicationError || !applicationData) {
        console.error(
          "Erreur lors du chargement de la candidature :",
          applicationError
        );
        setCandidature(null);
        setLoading(false);
        return;
      }

      const { data: missionData, error: missionError } =
        await supabase
          .from("missions")
          .select("id, title")
          .eq("id", applicationData.mission_id)
          .eq("organization_id", organizationData.id)
          .maybeSingle();

      if (missionError || !missionData) {
        console.error(
          "Mission inaccessible ou introuvable :",
          missionError
        );
        setCandidature(null);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", applicationData.candidate_id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Erreur lors du chargement du profil candidat :",
          profileError
        );
      }

      setCandidature({
        id: applicationData.id,
        name: profileData?.full_name ?? "Candidat",
        email: profileData?.email ?? "Email non disponible",
        mission_id: applicationData.mission_id,
        mission_title: missionData.title,
        motivation: applicationData.message ?? "",
        status: mapApplicationStatus(applicationData.status),
      });

      setLoading(false);
    }

    loadCandidature();
  }, [params.id, router, supabase]);

  const changeStatus = async (
    status: ApplicationStatus
  ) => {
    if (!candidature) {
      return;
    }

    setErrorMessage("");

    const databaseStatus = mapStatusToDatabase(status);

    const { error } = await supabase
      .from("applications")
      .update({
        status: databaseStatus,
      })
      .eq("id", candidature.id);

    if (error) {
      console.error(
        "Erreur lors de la mise à jour du statut :",
        error
      );

      setErrorMessage(
        "Impossible de mettre à jour le statut de la candidature."
      );

      return;
    }

    setCandidature({
      ...candidature,
      status,
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement...
        </p>
      </main>
    );
  }

  if (!candidature) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Candidature introuvable
          </h1>

          <button
            onClick={() =>
              router.push("/organisation")
            }
            className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
          >
            Retour au dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() =>
              router.push(
                `/organisation/candidatures?mission=${candidature.mission_id}`
              )
            }
            className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            ← Retour aux candidatures
          </button>
        </div>
      </header>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="font-semibold text-emerald-600">
              Candidature
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Nom complet
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {candidature.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Adresse email
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900 break-all">
                  {candidature.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Mission
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {candidature.mission_title}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Statut
                </p>

                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">
                  {candidature.status}
                </span>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-10">
              <p className="text-sm font-medium text-slate-500">
                Motivation
              </p>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                {candidature.motivation}
              </p>
            </div>

            {errorMessage && (
              <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-xl font-bold text-slate-900">
                Actions
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    changeStatus("En cours")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800"
                >
                  Mettre en cours
                </button>

                <button
                  onClick={() =>
                    changeStatus("Retenue")
                  }
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
                >
                  Retenir la candidature
                </button>

                <button
                  onClick={() =>
                    changeStatus("Refusée")
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function mapApplicationStatus(
  status: string | null
): ApplicationStatus {
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

function mapStatusToDatabase(
  status: ApplicationStatus
) {
  switch (status) {
    case "Retenue":
      return "accepted";

    case "Refusée":
      return "rejected";

    case "En cours":
      return "reviewing";

    case "Nouvelle":
    default:
      return "submitted";
  }
}