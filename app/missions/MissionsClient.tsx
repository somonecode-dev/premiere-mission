"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export default function MissionsClient() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const fromCandidate =
    searchParams.get("from") === "candidat";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      const { data, error } = await supabase
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
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Erreur lors du chargement des missions :",
          error
        );
        setMissions([]);
        setLoading(false);
        return;
      }

      const mappedMissions: Mission[] = (data ?? []).map(
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
      setLoading(false);
    }

    loadMissions();
  }, [supabase]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(missions.map((mission) => mission.category))
    );

    return ["Toutes", ...uniqueCategories];
  }, [missions]);

  const filteredMissions = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return missions.filter((mission) => {
      const matchesSearch =
        normalizedSearch === "" ||
        mission.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        mission.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        mission.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        mission.expectations
          .toLowerCase()
          .includes(normalizedSearch) ||
        mission.level
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "Toutes" ||
        mission.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [missions, search, category]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Chargement des missions...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href={fromCandidate ? "/candidatures" : "/"}
            className="group"
          >
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Première Mission
            </h1>

            <p className="text-xs text-slate-500">
              Ta première expérience professionnelle
            </p>
          </Link>

          <Link
            href={fromCandidate ? "/candidatures" : "/"}
            className="self-start shrink-0 whitespace-nowrap rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 md:px-5 md:py-2.5 md:text-sm"
          >
            {fromCandidate
              ? "Retour à mon dashboard"
              : "Retour à l'accueil"}
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              🚀 Des missions pour commencer
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Trouve une mission.
              <span className="block text-emerald-600">
                Commence ton expérience.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Découvre des missions courtes et concrètes proposées par
              des entreprises, associations et organisations.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Missions disponibles
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredMissions.length} mission
              {filteredMissions.length > 1 ? "s" : ""} trouvée
              {filteredMissions.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {filteredMissions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredMissions.map((mission) => (
              <article
                key={mission.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {mission.category}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    {mission.level}
                  </span>
                </div>

                <h4 className="mt-5 text-xl font-bold text-slate-900">
                  {mission.title}
                </h4>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {mission.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-xs text-slate-400">
                      Durée
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {mission.duration}
                    </p>
                  </div>

                  <Link
                    href={
                      fromCandidate
                        ? `/missions/${mission.id}?from=candidat`
                        : `/missions/${mission.id}`
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Voir la mission →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-4xl">📋</div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Aucune mission disponible
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Les nouvelles missions publiées apparaîtront ici.
            </p>
          </div>
        )}
      </section>

      {!fromCandidate && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14 text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              Tu ne trouves pas encore ta mission ?
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Les opportunités sont amenées à évoluer. De nouvelles
              missions seront publiées progressivement.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Retour à l'accueil
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-500">
          Première Mission — Transformer « aucune expérience » en
          première expérience.
        </div>
      </footer>
    </main>
  );
}

function formatDuration(days: number | null) {
  if (!days) {
    return "Durée non précisée";
  }

  return `${days} jour${days > 1 ? "s" : ""}`;
}