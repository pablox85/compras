"use client";

import { useState } from "react";
import PanelTitle from "./PanelTitle";
import AddDropdown from "./AddDropdown";
import ItemModal from "./ItemModal";
import { useCompras } from "@/app/hooks/useCompras";

type PanelSurtidoProps = {
  active: boolean;
  onSelectPanel: (panel: "surtido" | "mandados") => void;
  data: ReturnType<typeof useCompras>["data"];
  isHydrated: boolean;
  addCompra: ReturnType<typeof useCompras>["addCompra"];
  removeCompra: ReturnType<typeof useCompras>["removeCompra"];
};

export default function PanelSurtido({
  active,
  onSelectPanel,
  data,
  isHydrated,
  addCompra,
  removeCompra,
}: PanelSurtidoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortByCategory, setSortByCategory] = useState(false);

  const handleSelectCategory = (categoria: string) => {
    setSelectedCategory(categoria);
    setModalOpen(true);
  };

  const handleSaveItem = (nombre: string, cantidad: number) => {
    void addCompra("surtido", selectedCategory, nombre, cantidad);
    setModalOpen(false);
    setSelectedCategory("");
  };

  const compras = isHydrated ? data.surtido : [];
  
  const getDisplayItems = () => {
    if (!sortByCategory) {
      return { grouped: false, items: compras };
    }
    
    const grouped: Record<string, typeof compras> = {};
    compras.forEach((item) => {
      if (!grouped[item.categoria]) {
        grouped[item.categoria] = [];
      }
      grouped[item.categoria].push(item);
    });
    
    return { grouped: true, items: grouped, categories: Object.keys(grouped).sort() };
  };
  
  const displayData = getDisplayItems();

  return (
    <div
      onPointerDownCapture={() => onSelectPanel("surtido")}
      className={`relative min-h-40 flex-1 overflow-hidden rounded-xl border bg-slate-900/40 md:min-h-0 ${
        active ? "border-teal-500 ring-1 ring-teal-500/40" : "border-slate-800"
      }`}
    >
      <PanelTitle className="text-emerald-300/90" asButton>
        Surtido
      </PanelTitle>
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <AddDropdown onSelectCategory={handleSelectCategory} />
        <button
          onClick={() => setSortByCategory((prev) => !prev)}
          className={`rounded-lg px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.28em] sm:text-[0.875rem] sm:tracking-[0.32em] transition ${
            sortByCategory
              ? "bg-emerald-700 text-slate-100"
              : "bg-teal-900 text-emerald-300/90"
          }`}
        >
          Sort
        </button>
      </div>

      <div className="h-full overflow-y-auto p-4 pr-30 pt-16">
        {displayData.grouped ? (
          <div className="space-y-4">
            {displayData.categories?.map((categoria) => (
              <div key={categoria}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {categoria}
                </h3>
                <ul className="space-y-1">
                  {displayData.items[categoria].map((compra) => (
                    <li
                      key={compra.id}
                      className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-200"
                    >
                        <div>
                          {compra.nombre} <span className="text-slate-400">({compra.cantidad})</span>{" "}
                          <span className="text-xs text-slate-500">por {compra.created_by_login}</span>
                        </div>
                      <button
                        onClick={() => removeCompra("surtido", compra.id)}
                        className="text-xs text-slate-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {compras.map((compra) => (
              <li
                key={compra.id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-200"
              >
                <div>
                  <span className="text-emerald-300">{compra.categoria}</span> · {compra.nombre}{" "}
                  <span className="text-slate-400">({compra.cantidad})</span>{" "}
                  <span className="text-xs text-slate-500">por {compra.created_by_login}</span>
                </div>
                <button
                  onClick={() => removeCompra("surtido", compra.id)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ItemModal
        isOpen={modalOpen}
        categoria={selectedCategory}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory("");
        }}
        onSave={handleSaveItem}
      />
    </div>
  );
}
