"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PanelSurtido from "@/app/reutilizables/PanelSurtido";
import PanelMandados from "@/app/reutilizables/PanelMandados";
import HamburgerMenu from "@/app/reutilizables/HamburgerMenu";
import { useCompras } from "@/app/hooks/useCompras";

type PanelKey = "surtido" | "mandados";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPanel, setSelectedPanel] = useState<PanelKey>("surtido");
  const { data, isHydrated, addCompra, removeCompra, clearPanel } = useCompras();
  const navbarClassName =
    "h-14 sm:h-16 rounded-xl bg-blue-800 px-4 sm:px-6 py-2 shadow-lg shadow-black/30 flex items-center justify-between";

  const handleLogout = () => {
    document.cookie = "auth=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 p-3 text-slate-100 sm:p-4">
      <nav className={navbarClassName}>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight sm:text-xl">
          Dashboard de compras
        </h1>
        <HamburgerMenu
          onLogout={handleLogout}
          onSelectPanel={setSelectedPanel}
          selectedPanel={selectedPanel}
          onClearPanel={() => clearPanel(selectedPanel)}
        />
      </nav>

      <div className="flex-1 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4 mt-4">
        <section className="flex flex-col gap-4">
          <PanelSurtido
            active={selectedPanel === "surtido"}
            selectedPanel={selectedPanel}
            onSelectPanel={setSelectedPanel}
            data={data}
            isHydrated={isHydrated}
            addCompra={addCompra}
            removeCompra={removeCompra}
          />
        </section>

        <section className="flex flex-col gap-4">
          <PanelMandados
            active={selectedPanel === "mandados"}
            selectedPanel={selectedPanel}
            onSelectPanel={setSelectedPanel}
            data={data}
            isHydrated={isHydrated}
            addCompra={addCompra}
            removeCompra={removeCompra}
          />
        </section>
      </div>
    </div>
  );
}
