"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Première Mission
            </h1>
            <p className="text-xs text-slate-500">
              Ta première expérience professionnelle
            </p>
          </div>

          <Link
            href="/connexion"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center sm:items-start sm:text-left">
          <div className="mb-6 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            🚀 Des missions pour décrocher ta première expérience
          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tu n'as pas encore d'expérience ?
            <span className="block text-emerald-600">
              Commence par une première mission.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Première Mission met en relation de jeunes talents avec de petites
            missions concrètes proposées par des entreprises, associations et
            organisations.
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:justify-start">
            <Link
              href="/missions"
              className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-center font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
            >
              Trouver ma première mission →
            </Link>

            <Link 
              href="/proposer-mission"
              className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto">
              Je propose une mission
            </Link>
          </div>
        </div>

        {/* Première mission */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-4 text-2xl">🎯</div>
            <h3 className="text-lg font-semibold">
              Des missions accessibles
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Des tâches courtes et concrètes adaptées aux profils qui
              cherchent leur première expérience.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-4 text-2xl">💼</div>
            <h3 className="text-lg font-semibold">
              Une vraie expérience
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chaque mission réalisée devient une expérience que tu peux
              valoriser dans ton parcours professionnel.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-4 text-2xl">📈</div>
            <h3 className="text-lg font-semibold">
              Construis ton profil
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Accumule progressivement des missions, des compétences et des
              recommandations.
            </p>
          </div>
        </div>

        {/* Démo interactive */}
        {started && (
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:text-left">
            <h3 className="text-xl font-bold text-emerald-900">
              🎉 C'est parti !
            </h3>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Dans la prochaine étape, nous allons afficher les premières
              missions disponibles et permettre au candidat d'en choisir une.
            </p>

            <button
              onClick={() => setStarted(false)}
              className="mt-4 text-sm font-semibold text-emerald-700 underline"
            >
              Fermer
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-500">
          Première Mission — Transformer « aucune expérience » en première
          expérience.
        </div>
      </footer>
    </main>
  );
}