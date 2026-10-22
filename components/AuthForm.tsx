"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/auth/actions";

export default function AuthForm({ kind, next }: { kind: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(kind === "login" ? login : signup, null);
  const isSignup = kind === "signup";
  return (
    <form action={action} className="card mx-auto grid w-full max-w-md gap-4 p-6">
      <h1 className="h-display text-3xl">{isSignup ? "Create your account" : "Sign in"}</h1>
      <input type="hidden" name="next" value={next} />
      {isSignup && (
        <>
          <div>
            <label className="label" htmlFor="full_name">Full name</label>
            <input id="full_name" name="full_name" className="input" required autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone / WhatsApp</label>
            <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="03xx xxxxxxx" />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" required minLength={isSignup ? 8 : undefined} autoComplete={isSignup ? "new-password" : "current-password"} />
        {isSignup && <p className="note mt-1">At least 8 characters.</p>}
      </div>
      {state?.error && <p className="err" role="alert">{state.error}</p>}
      {state?.message && <p className="text-sm text-ok" role="status">{state.message}</p>}
      <button className="btn btn-gold" disabled={pending}>{pending ? "Please wait" : isSignup ? "Create account" : "Sign in"}</button>
      <p className="note">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link className="text-gold-soft underline" href={isSignup ? `/login?next=${encodeURIComponent(next)}` : `/signup?next=${encodeURIComponent(next)}`}>
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
