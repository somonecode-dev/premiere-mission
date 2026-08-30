"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mission = {
  id: string;
  title: string;
  description: string;
  expectations: string | null;
  duration_days: number;
  level: string;
  domain: string;
  is_active: boolean;
};

export default function CandidaturePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => createClient(), []);

  const missionId = String(params.id);

  const fromCandidate =
    searchParams.get("from") === "candidat";

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [motivation, setMotivation] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const currentPath = `/missions/${missionId}/candidature${
          fromCandidate ? "?from=candidat" : ""
        }`;

        router.replace(
          `/connexion?redirectTo=${encodeURIComponent(currentPath)}`
        );

        return;
      }

      /*
       * Récupération de la mission depuis Supabase.
       */
      const { data: missionData, error: missionError } =
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
              is_active
            `
          )
          .eq("id", missionId)
          .maybeSingle();

      if (missionError) {
        console.error(
          "Erreur lors du chargement de la mission :",
          missionError
        );

        setError(
          "Impossible de charger cette mission pour le moment."
        );
        setLoading(false);
        return;
      }

      setMission(missionData ?? null);

      /*
       * Récupération du profil candidat.
       *
       * L'ID du profil correspond à l'ID de l'utilisateur
       * actuellement connecté dans Supabase Auth.
       */
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Erreur lors du chargement du profil :",
          profileError
        );
      }

      /*
       * On privilégie les informations présentes dans profiles.
       * L'email Auth sert de fallback si nécessaire.
       */
      setName(profileData?.full_name ?? "");
      setEmail(profileData?.email ?? user.email ?? "");

      setLoading(false);
    }

    loadPage();
  }, [
    missionId,
    router,
    supabase,
    fromCandidate,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (submitting) {
      return;
    }

    if (!name.trim() || !email.trim() || !motivation.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!mission) {
      setError("Cette mission n'existe plus.");
      return;
    }

    if (!mission.is_active) {
      setError(
        "Cette mission n'est plus disponible."
      );
      return;
    }

    setSubmitting(true);

    /*
     * Vérification de l'utilisateur connecté.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "Votre session a expiré. Veuillez vous reconnecter."
      );
      setSubmitting(false);
      return;
    }

    /*
     * Vérification d'une candidature existante
     * pour cette mission et ce candidat.
     */
    const { data: existingApplication, error: duplicateError } =
      await supabase
        .from("applications")
        .select("id")
        .eq("mission_id", mission.id)
        .eq("candidate_id", user.id)
        .limit(1);

    if (duplicateError) {
      console.error(
        "Erreur lors de la vérification du doublon :",
        duplicateError
      );

      setError(
        "Impossible de vérifier votre candidature. Veuillez réessayer."
      );
      setSubmitting(false);
      return;
    }

    if (
      existingApplication &&
      existingApplication.length > 0
    ) {
      setError(
        "Tu as déjà envoyé une candidature pour cette mission."
      );
      setSubmitting(false);
      return;
    }

    /*
     * Création de la candidature dans Supabase.
     *
     * Correspondance avec l'ancien localStorage :
     *
     * missionId     -> mission_id
     * candidateId   -> candidate_id
     * motivation   -> message
     * Nouvelle      -> submitted
     */
    const { error: insertError } = await supabase
      .from("applications")
      .insert({
        mission_id: mission.id,
        candidate_id: user.id,
        message: motivation.trim(),
        status: "submitted",
      });

    if (insertError) {
      console.error(
        "Erreur lors de l'enregistrement de la candidature :",
        insertError
      );

      /*
       * Si une contrainte d'unicité est présente en base,
       * on traite également ce cas comme un doublon.
       */
      if (
        insertError.code === "23505"
      ) {
        setError(
          "Tu as déjà envoyé une candidature pour cette mission."
        );
      } else {
        setError(
          "Une erreur est survenue lors de l'envoi de ta candidature. Veuillez réessayer."
        );
      }

      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

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
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">
              🔎
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Mission introuvable
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Cette mission n'existe plus ou n'est plus disponible.
            </p>

            <button
              onClick={() =>
                router.push(
                  fromCandidate
                    ? "/missions?from=candidat"
                    : "/missions"
                )
              }
              className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Voir les missions
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-5xl">
              ✓
            </div>

            <h1 className="text-4xl font-bold text-slate-900">
              Candidature envoyée !
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Ta candidature pour la mission{" "}
              <strong>{mission.title}</strong> a bien été prise en
              compte.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() =>
                  router.push(
                    fromCandidate
                      ? `/missions/${mission.id}?from=candidat`
                      : `/missions/${mission.id}`
                  )
                }
                className="rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white"
              >
                Retour à la mission
              </button>

              <button
                onClick={() =>
                  router.push(
                    fromCandidate
                      ? "/missions?from=candidat"
                      : "/missions"
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-800"
              >
                Voir d'autres missions
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const durationLabel =
    mission.duration_days === 1
      ? "1 jour"
      : `${mission.duration_days} jours`;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Première Mission
            </h1>

            <p className="mt-2 text-lg text-slate-600">
              Ta première expérience professionnelle
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                fromCandidate
                  ? `/missions/${mission.id}?from=candidat`
                  : `/missions/${mission.id}`
              )
            }
            className="order-first shrink-0 self-start whitespace-nowrap text-sm font-medium text-slate-800 transition hover:text-emerald-600 md:order-none md:px-6 md:py-3 md:text-base"
          >
            ← Retour à la mission
          </button>
        </div>
      </header>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex rounded-full bg-emerald-50 px-5 py-3 font-semibold text-emerald-700">
              🚀 Candidature
            </div>

            <h2 className="text-5xl font-bold text-slate-900">
              Postule à cette mission.
            </h2>

            <p className="mt-5 text-xl text-slate-600">
              Présente-toi simplement et explique pourquoi tu souhaites
              réaliser cette mission.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-700">
              Mission
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {mission.title}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {mission.domain} · {mission.level} ·{" "}
              {durationLabel}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12"
          >
            <div className="space-y-8">
              <div>
                <label
                  htmlFor="name"
                  className="mb-3 block font-semibold text-slate-900"
                >
                  Nom complet
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Ex. Amadou Diallo"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block font-semibold text-slate-900"
                >
                  Adresse email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-6 py-5 text-slate-600 outline-none"
                  required
                />

                <p className="mt-2 text-sm text-slate-500">
                  Cette adresse correspond à ton compte connecté.
                </p>
              </div>

              <div>
                <label
                  htmlFor="motivation"
                  className="mb-3 block font-semibold text-slate-900"
                >
                  Pourquoi souhaites-tu réaliser cette mission ?
                </label>

                <textarea
                  id="motivation"
                  value={motivation}
                  onChange={(e) =>
                    setMotivation(e.target.value)
                  }
                  placeholder="Présente brièvement ta motivation, tes compétences ou ce que tu souhaites apprendre..."
                  rows={7}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">
                  {mission.title}
                </h3>

                <p className="mt-2 text-slate-600">
                  Ta candidature sera associée à cette mission.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Envoi de la candidature..."
                  : "Envoyer ma candidature →"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}