"use client";

import { useEffect, useRef, useState } from "react";

type ItemModalProps = {
  isOpen: boolean;
  categoria: string;
  onClose: () => void;
  onSave: (nombre: string, cantidad: number) => void;
};

export default function ItemModal({
  isOpen,
  categoria,
  onClose,
  onSave,
}: ItemModalProps) {
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onSave(nombre, cantidad);
      setNombre("");
      setCantidad(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-teal-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300/70">
          {categoria}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Nombre del artículo
            </label>
            <input
              ref={inputRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Leche"
              className="w-full rounded-lg border border-teal-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full rounded-lg border border-teal-700 bg-slate-800 px-4 py-2 text-slate-100 outline-none transition focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
