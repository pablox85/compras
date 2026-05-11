"use client";

import { useRef, useState } from "react";

type HamburgerMenuProps = {
  onLogout: () => void;
  onSelectPanel: (panel: "surtido" | "mandados") => void;
  selectedPanel: "surtido" | "mandados";
  onClearPanel?: () => void;
};

export default function HamburgerMenu({
  onLogout,
  onSelectPanel,
  selectedPanel,
  onClearPanel,
}: HamburgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  return (
    <div ref={menuContainerRef} className="relative z-40">
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        onClick={handleMenuClick}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500 transition-colors sm:h-11 sm:w-11 ${
          menuOpen ? "bg-blue-800" : "bg-blue-700 hover:bg-blue-600"
        }`}
      >
        <span className="sr-only">Menu</span>
        <div className="relative h-5 w-5">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-5 bg-slate-100 transition-all duration-300 ease-in-out ${
              menuOpen ? "translate-y-2 rotate-45" : "translate-y-0 rotate-0"
            }`}
          />
          <span
            className={`absolute left-0 top-2 block h-0.5 w-5 bg-slate-100 transition-all duration-300 ease-in-out ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-4 block h-0.5 w-5 bg-slate-100 transition-all duration-300 ease-in-out ${
              menuOpen ? "-translate-y-2 -rotate-45" : "translate-y-0 rotate-0"
            }`}
          />
        </div>
      </button>

      <div
        className={`absolute right-0 top-14 z-50 mt-1 w-48 origin-top-right rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-lg shadow-black/30 transition-all duration-300 ease-in-out sm:w-64 md:mt-3 ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              handleMenuItemClick();
              onSelectPanel("surtido");
            }}
            className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-[0.875rem] transition-colors ${
              selectedPanel === "surtido"
                ? "bg-teal-900 text-emerald-300"
                : "text-slate-100 hover:bg-slate-800"
            }`}
          >
            Surtido
          </button>
          <button
            type="button"
            onClick={() => {
              handleMenuItemClick();
              onSelectPanel("mandados");
            }}
            className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-[0.875rem] transition-colors ${
              selectedPanel === "mandados"
                ? "bg-teal-900 text-emerald-300"
                : "text-slate-100 hover:bg-slate-800"
            }`}
          >
            Mandados
          </button>
        </div>

        <div className="mt-3 border-t border-slate-700 pt-3">
          <button
            type="button"
            onClick={() => {
              handleMenuItemClick();
              onClearPanel?.();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-[0.875rem] text-yellow-300 hover:bg-slate-800"
          >
            Limpiar datos
          </button>
          <button
            type="button"
            onClick={() => {
              handleMenuItemClick();
              onLogout();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-[0.875rem] text-red-300 hover:bg-slate-800"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
