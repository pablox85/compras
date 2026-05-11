"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase/client";
import { useTenant } from "./hooks/useTenant";

export default function Home() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const { session, loading } = useTenant();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(true);

  const isEmailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/dashboard");
    }
  }, [loading, router, session]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isEmailValid) {
      setError("Ingresa un correo valido.");
      return;
    }

    if (!isPasswordValid) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    void (async () => {
      if (isSigningIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              login: email,
              display_name: email.split("@")[0],
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }
      }

      router.push("/dashboard");
    })();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20 sm:p-8">
        <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
          {isSigningIn ? "Iniciar sesion" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-slate-400">
          {isSigningIn ? "Ingresa con tu cuenta para continuar." : "Crea tu usuario para empezar."}
        </p>

        <form className="mt-5 space-y-4 sm:mt-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none ring-slate-300 transition focus:ring-2"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Contrasena</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimo 6 caracteres"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-24 text-slate-100 placeholder:text-slate-500 outline-none ring-slate-300 transition focus:ring-2"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-300"
          >
            {isSigningIn ? "Entrar" : "Registrarme"}
          </button>

          <button
            type="button"
            onClick={() => setIsSigningIn((previous) => !previous)}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-800"
          >
            {isSigningIn ? "No tengo cuenta" : "Ya tengo cuenta"}
          </button>
        </form>
      </section>
    </main>
  );
}
