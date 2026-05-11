"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PanelSurtido from "@/app/reutilizables/PanelSurtido";
import PanelMandados from "@/app/reutilizables/PanelMandados";
import HamburgerMenu from "@/app/reutilizables/HamburgerMenu";
import { useCompras } from "@/app/hooks/useCompras";
import { useTenant } from "@/app/hooks/useTenant";

type PanelKey = "surtido" | "mandados";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPanel, setSelectedPanel] = useState<PanelKey>("surtido");
  const {
    session,
    loading: tenantLoading,
    organizations,
    activeOrganization,
    activeOrganizationId,
    currentLogin,
    signOut,
    createOrganization,
    setActiveOrganization,
  } = useTenant();
  const { data, loading: comprasLoading, addCompra, removeCompra, clearPanel, error } = useCompras(
    activeOrganizationId,
    currentLogin
  );
  const [organizationName, setOrganizationName] = useState("");
  const [organizationError, setOrganizationError] = useState("");
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const navbarClassName =
    "h-14 sm:h-16 rounded-xl bg-blue-800 px-4 sm:px-6 py-2 shadow-lg shadow-black/30 flex items-center justify-between";

  useEffect(() => {
    if (!tenantLoading && !session) {
      router.replace("/");
    }
  }, [router, session, tenantLoading]);

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrganizationError("");

    if (!organizationName.trim()) {
      setOrganizationError("Escribe el nombre de la organización.");
      return;
    }

    setCreatingOrganization(true);
    const { error: createError } = await createOrganization(organizationName.trim());
    setCreatingOrganization(false);

    if (createError) {
      setOrganizationError(createError.message);
      return;
    }

    setOrganizationName("");
  };

  const headerSubtitle = useMemo(() => {
    if (!activeOrganization) return "Sin organización activa";
    return `Organización: ${activeOrganization.name}`;
  }, [activeOrganization]);

  if (tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Cargando sesion...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 p-3 text-slate-100 sm:p-4">
      <nav className={navbarClassName}>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">Dashboard de compras</h1>
          <p className="truncate text-xs text-slate-300/80 sm:text-sm">{headerSubtitle}</p>
        </div>
        <div className="mr-2 hidden items-center gap-2 md:flex">
          {organizations.length > 0 ? (
            <select
              value={activeOrganizationId ?? ""}
              onChange={(event) => void setActiveOrganization(event.target.value)}
              className="rounded-lg border border-blue-400 bg-blue-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <HamburgerMenu
          onLogout={signOut}
          onSelectPanel={setSelectedPanel}
          selectedPanel={selectedPanel}
          onClearPanel={() => clearPanel(selectedPanel)}
        />
      </nav>

      {activeOrganizationId ? null : (
        <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-100">
          <h2 className="text-lg font-semibold">Crea tu organización</h2>
          <p className="mt-1 text-sm text-slate-400">
            La organización define qué usuarios ven las mismas compras.
          </p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateOrganization}>
            <input
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              placeholder="Ej: Familia Perez"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none"
            />
            <button
              type="submit"
              disabled={creatingOrganization}
              className="rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {creatingOrganization ? "Creando..." : "Crear organización"}
            </button>
          </form>
          {organizationError ? <p className="mt-3 text-sm text-red-400">{organizationError}</p> : null}
        </section>
      )}

      <div className="mt-4 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
        <section className="flex flex-col gap-4">
          <PanelSurtido
            active={selectedPanel === "surtido"}
            onSelectPanel={setSelectedPanel}
            data={data}
            isHydrated={!comprasLoading}
            addCompra={addCompra}
            removeCompra={removeCompra}
          />
        </section>

        <section className="flex flex-col gap-4">
          <PanelMandados
            active={selectedPanel === "mandados"}
            onSelectPanel={setSelectedPanel}
            data={data}
            isHydrated={!comprasLoading}
            addCompra={addCompra}
            removeCompra={removeCompra}
          />
        </section>
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
