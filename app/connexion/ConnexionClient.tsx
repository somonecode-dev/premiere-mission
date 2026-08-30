"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setError("Impossible de récupérer ton profil.");
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");

    if (redirectTo) {
      router.push(redirectTo);
    } else if (profile.role === "organization") {
      router.push("/organisation");
    } else {
      router.push("/candidatures");
    }

    router.refresh();
  }

  function handleCreateAccount() {
    const redirectTo = searchParams.get("redirectTo");

    if (redirectTo) {
      router.push(
        `/inscription?redirectTo=${encodeURIComponent(redirectTo)}`
      );
      return;
    }

    router.push("/inscription");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Première Mission
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Se connecter
            </h1>

            <p className="mt-2 text-slate-600">
              Connecte-toi pour accéder à ton espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemple@email.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-sm text-slate-400">
              ou
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
          >
            Créer un compte
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 w-full text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ConnexionClient() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
          <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">Chargement...</p>
            </div>
          </div>
        </main>
      }
    >
      <ConnexionContent />
    </Suspense>
  );
}