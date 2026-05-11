"use client";

import { useEffect, useRef, useState } from "react";

const options = [
  "Almacen",
  "Carnicera",
  "Lacteos",
  "Frutas y Verdura",
  "Panadera",
  "Congelados",
  "Bebidas",
  "Limpieza",
  "Higiene",
  "Otros",
];

type AddDropdownProps = {
  onSelectCategory: (categoria: string) => void;
};

export default function AddDropdown({ onSelectCategory }: AddDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSelectCategory = (categoria: string) => {
    onSelectCategory(categoria);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg bg-teal-900 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.28em] text-emerald-300/90 sm:text-[0.875rem] sm:tracking-[0.32em]"
      >
        Add +
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-teal-700 bg-slate-950 shadow-lg shadow-black/30">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectCategory(option)}
              className="block w-full px-3 py-2 text-left text-sm text-emerald-100 hover:bg-teal-900/80"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}