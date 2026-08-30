"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      console.log("User:", session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}