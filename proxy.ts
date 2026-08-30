import { createServerClient } from "@supabase/ssr";

import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /*
   * ============================================================
   * 1. ROUTES PROTÉGÉES : CONNEXION OBLIGATOIRE
   * ============================================================
   *
   * /proposer-mission est volontairement absent ici.
   * Le formulaire doit être accessible même déconnecté.
   */
  const isProtectedPath =
    pathname === "/organisation" ||
    pathname.startsWith("/organisation/") ||
    pathname === "/candidatures" ||
    pathname.startsWith("/candidatures/") ||
    /^\/missions\/[^/]+\/candidature$/.test(pathname);

  /*
   * Utilisateur non connecté
   * → redirection vers la connexion
   * → conservation de la destination demandée
   */
  if (isProtectedPath && !user) {
    const loginUrl = new URL("/connexion", request.url);

    loginUrl.searchParams.set(
      "redirect",
      `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * ============================================================
   * 2. UTILISATEUR CONNECTÉ : VÉRIFICATION DU RÔLE
   * ============================================================
   */

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    /*
     * ==========================================================
     * ORGANISATION
     * ==========================================================
     */

    if (profile?.role === "organization") {
      /*
       * Une organisation ne peut pas accéder
       * à l'espace candidat.
       */
      if (
        pathname === "/candidatures" ||
        pathname.startsWith("/candidatures/")
      ) {
        return NextResponse.redirect(
          new URL("/organisation", request.url)
        );
      }

      /*
       * Une organisation ne peut pas postuler à une mission.
       */
      if (/^\/missions\/[^/]+\/candidature$/.test(pathname)) {
        return NextResponse.redirect(
          new URL("/organisation", request.url)
        );
      }
    }

    /*
     * ==========================================================
     * CANDIDAT
     * ==========================================================
     */

    if (profile?.role === "candidate") {
      /*
       * Un candidat ne peut pas accéder
       * à l'espace organisation ni proposer une mission.
       *
       * Cette protection est volontairement conservée.
       */
      if (
        pathname === "/organisation" ||
        pathname.startsWith("/organisation/") ||
        pathname === "/proposer-mission" ||
        pathname.startsWith("/proposer-mission/")
      ) {
        return NextResponse.redirect(
          new URL("/candidatures", request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/organisation/:path*",
    "/proposer-mission/:path*",
    "/candidatures/:path*",
    "/missions/:path*/candidature",
  ],
};