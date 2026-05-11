import { useCallback, useEffect, useState } from "react";

export type PanelType = "surtido" | "mandados";

export type Compra = {
  id: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  usuario: string;
};

const STORAGE_KEY = "compras_app_data";

const getInitialState = (): Record<PanelType, Compra[]> => {
  if (typeof window === "undefined") {
    return { surtido: [], mandados: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }

  return { surtido: [], mandados: [] };
};

export function useCompras() {
  const [data, setData] = useState<Record<PanelType, Compra[]> | null>(null);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    setData(getInitialState());
  }, []);

  // Sync to localStorage whenever data changes
  useEffect(() => {
    if (data !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const addCompra = useCallback(
    (panel: PanelType, categoria: string, nombre: string, cantidad: number, usuario: string) => {
      const newCompra: Compra = {
        id: `${Date.now()}-${Math.random()}`,
        categoria,
        nombre,
        cantidad,
        usuario,
      };

      setData((prev) => {
        const current = prev ?? { surtido: [], mandados: [] };
        return {
          ...current,
          [panel]: [...current[panel], newCompra],
        };
      });
    },
    []
  );

  const removeCompra = useCallback((panel: PanelType, id: string) => {
    setData((prev) => {
      const current = prev ?? { surtido: [], mandados: [] };
      return {
        ...current,
        [panel]: current[panel].filter((compra) => compra.id !== id),
      };
    });
  }, []);

  const updateCompra = useCallback(
    (panel: PanelType, id: string, updates: Partial<Compra>) => {
      setData((prev) => {
        const current = prev ?? { surtido: [], mandados: [] };
        return {
          ...current,
          [panel]: current[panel].map((compra) =>
            compra.id === id ? { ...compra, ...updates } : compra
          ),
        };
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData({ surtido: [], mandados: [] });
  }, []);

  const clearPanel = useCallback((panel: PanelType) => {
    setData((prev) => {
      const current = prev ?? { surtido: [], mandados: [] };
      return {
        ...current,
        [panel]: [],
      };
    });
  }, []);

  return {
    data: data ?? { surtido: [], mandados: [] },
    isHydrated: data !== null,
    addCompra,
    removeCompra,
    updateCompra,
    clearAll,
    clearPanel,
  };
}
