"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le menu profil"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50/80 text-slate-600 transition hover:border-emerald-500 hover:bg-white hover:text-emerald-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-sm">
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="text-lg">👤</span>
              <span className="font-medium">Profil</span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="text-lg">🔔</span>
              <span className="font-medium">Notifications</span>
            </button>

            <div className="border-t border-slate-100 p-1.5">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}