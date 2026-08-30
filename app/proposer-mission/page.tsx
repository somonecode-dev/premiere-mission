"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposerMissionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [description, setDescription] = useState("");
  const [expectations, setExpectations] = useState("");
  const [duration, setDuration] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  console.log("🟢 SUBMIT : le formulaire est bien déclenché");

  setError("");

  if (
    !title.trim() ||
    !category.trim() ||
    !description.trim() ||
    !expectations.trim() ||
    !duration.trim()
  ) {
    console.log("🔴 VALIDATION : un ou plusieurs champs sont vides");
    setError("Veuillez remplir tous les champs.");
    return;
  }

  console.log("🟢 VALIDATION : tous les champs sont remplis");

  setLoading(true);

  try {
    console.log("🟡 AUTH : récupération de l'utilisateur...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("🟡 AUTH RESULT :", { user, userError });

    if (userError || !user) {
      console.log("🔴 AUTH : utilisateur introuvable");
      setError("Votre session a expiré. Veuillez vous reconnecter.");
      return;
    }

    console.log("🟢 AUTH : utilisateur connecté :", user.id);

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (organizationError || !organization) {
      console.error(
         "Erreur lors de la récupération de l'organisation :",
      organizationError
    );
    setError("Impossible de retrouver votre organisation.");
    return;
}

    const { error: insertError } = await supabase
      .from("missions")
      .insert({
        organization_id: organization.id,
        title: title.trim(),
        description: description.trim(),
        expectations: expectations.trim(),
        duration_days: Number.parseInt(duration, 10) || 1,
        level,
        domain: category.trim(),
        is_active: true,
      });

    console.log("🟡 INSERT RESULT :", insertError);

    if (insertError) {
      console.error("🔴 INSERT ERROR :", insertError);
      setError("Impossible de publier la mission.");
      return;
    }

    console.log("🟢 INSERT : mission créée avec succès");

    console.log("➡️ REDIRECTION : /organisation");

    router.push("/organisation");
    router.refresh();
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-600">
              Espace organisation
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Proposer une mission
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-slate-900">
            Créer une nouvelle mission
          </h2>

          <p className="mt-3 text-lg text-slate-600">
            Décrivez une petite mission concrète pour permettre à un
            jeune talent d'acquérir sa première expérience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="grid gap-8">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Titre de la mission
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex. Créer une page vitrine simple"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="text-sm font-semibold text-slate-700"
                >
                  Catégorie
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Développement web">
                    Développement web
                  </option>
                  <option value="Communication">Communication</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Administration">Administration</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="text-sm font-semibold text-slate-700"
                >
                  Niveau
                </label>

                <select
                  id="level"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                >
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-700"
              >
                Description de la mission
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Expliquez simplement ce que devra réaliser le candidat."
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="expectations"
                className="text-sm font-semibold text-slate-700"
              >
                Ce qui est attendu
              </label>

              <textarea
                id="expectations"
                value={expectations}
                onChange={(event) => setExpectations(event.target.value)}
                placeholder="Ex. Une page responsive avec présentation de l'association et formulaire de contact."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="text-sm font-semibold text-slate-700"
              >
                Durée / délai
              </label>

              <input
                id="duration"
                type="text"
                autoComplete="off"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Ex. 3 jours"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Publication..." : "Publier la mission"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}