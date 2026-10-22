"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | null;

function safeNext(v: FormDataEntryValue | null): string {
  const s = String(v ?? "/");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  });
  if (error) return { error: error.message };
  redirect(safeNext(fd.get("next")));
}

export async function signup(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const full_name = String(fd.get("full_name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  if (!full_name) return { error: "Enter your name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const origin = (await headers()).get("origin") ?? "";
  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name, phone }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect(safeNext(fd.get("next")));
  return { message: "Account created. Open the confirmation email we sent you, then sign in." };
}

export async function logout() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}
