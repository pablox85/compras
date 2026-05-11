import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client";

export type PanelType = "surtido" | "mandados";

export type Compra = {
  id: string;
  organization_id: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  panel: PanelType;
  created_by_login: string;
  created_at: string;
};

type LoadState = Record<PanelType, Compra[]>;

const emptyData = (): LoadState => ({ surtido: [], mandados: [] });

export function useCompras(organizationId: string | null, creatorLogin: string | null) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [data, setData] = useState<LoadState>(emptyData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompras = useCallback(async () => {
    if (!organizationId) {
      setData(emptyData());
      return;
    }

    setLoading(true);
    setError(null);

    const { data: rows, error: loadError } = await supabase
      .from("compras")
      .select("id, organization_id, categoria, nombre, cantidad, panel, created_by_login, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setData(emptyData());
      setLoading(false);
      return;
    }

    const nextData = emptyData();
    (rows ?? []).forEach((item) => {
      nextData[item.panel as PanelType].push(item as Compra);
    });

    setData(nextData);
    setLoading(false);
  }, [organizationId, supabase]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!organizationId) {
        if (!cancelled) {
          setData(emptyData());
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const { data: rows, error: loadError } = await supabase
        .from("compras")
        .select("id, organization_id, categoria, nombre, cantidad, panel, created_by_login, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        setData(emptyData());
        setLoading(false);
        return;
      }

      const nextData = emptyData();
      (rows ?? []).forEach((item) => {
        nextData[item.panel as PanelType].push(item as Compra);
      });

      setData(nextData);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase]);

  const addCompra = useCallback(
    async (panel: PanelType, categoria: string, nombre: string, cantidad: number) => {
      if (!organizationId || !creatorLogin) {
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("compras").insert({
        organization_id: organizationId,
        categoria,
        nombre,
        cantidad,
        panel,
        created_by_login: creatorLogin,
        created_by: userData.user?.id,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      await loadCompras();
    },
    [creatorLogin, loadCompras, organizationId, supabase]
  );

  const removeCompra = useCallback(
    async (_panel: PanelType, id: string) => {
      const { error: deleteError } = await supabase
        .from("compras")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId ?? "");

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      await loadCompras();
    },
    [loadCompras, organizationId, supabase]
  );

  const updateCompra = useCallback(
    async (panel: PanelType, id: string, updates: Partial<Compra>) => {
      const { error: updateError } = await supabase
        .from("compras")
        .update(updates)
        .eq("id", id)
        .eq("panel", panel)
        .eq("organization_id", organizationId ?? "");

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await loadCompras();
    },
    [loadCompras, organizationId, supabase]
  );

  const clearAll = useCallback(() => {
    if (!organizationId) return;

    void (async () => {
      const { error: clearError } = await supabase
        .from("compras")
        .delete()
        .eq("organization_id", organizationId);

      if (clearError) {
        setError(clearError.message);
        return;
      }

      await loadCompras();
    })();
  }, [loadCompras, organizationId, supabase]);

  const clearPanel = useCallback(
    (panel: PanelType) => {
      if (!organizationId) return;

      void (async () => {
        const { error: clearError } = await supabase
          .from("compras")
          .delete()
          .eq("organization_id", organizationId)
          .eq("panel", panel);

        if (clearError) {
          setError(clearError.message);
          return;
        }

        await loadCompras();
      })();
    },
    [loadCompras, organizationId, supabase]
  );

  return {
    data,
    isHydrated: true,
    loading,
    error,
    addCompra,
    removeCompra,
    updateCompra,
    clearAll,
    clearPanel,
  };
}
