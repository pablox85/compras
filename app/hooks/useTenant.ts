"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client";

type Organization = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
};

type MembershipRow = {
  id: string;
  role: "admin" | "member";
  organization: Organization | null;
};

type ProfileRow = {
  id: string;
  login: string;
  display_name: string | null;
  active_organization_id: string | null;
};

const ACTIVE_ORG_KEY = "compras_active_org_id";

export function useTenant() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);

  const refreshWorkspace = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setProfile(null);
        setOrganizations([]);
        setActiveOrganizationId(null);
        return;
      }

      const [profileResult, membershipsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, login, display_name, active_organization_id")
          .eq("id", currentSession.user.id)
          .maybeSingle(),
        supabase
          .from("memberships")
          .select("id, role, organization:organizations(id, name, slug, owner_id, created_at)")
          .eq("user_id", currentSession.user.id),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data as ProfileRow);
      }

      const memberships = (membershipsResult.data ?? []) as MembershipRow[];
      const nextOrganizations = memberships
        .map((membership) => membership.organization)
        .filter((organization): organization is Organization => organization !== null);

      setOrganizations(nextOrganizations);

      const storedOrganizationId =
        typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_ORG_KEY) : null;
      const preferredOrganizationId =
        profileResult.data?.active_organization_id ?? storedOrganizationId ?? nextOrganizations[0]?.id ?? null;
      const isValidSelection = nextOrganizations.some(
        (organization) => organization.id === preferredOrganizationId
      );

      setActiveOrganizationId(isValidSelection ? preferredOrganizationId : nextOrganizations[0]?.id ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await refreshWorkspace(data.session);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await refreshWorkspace(nextSession);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [refreshWorkspace, supabase]);

  useEffect(() => {
    if (activeOrganizationId) {
      window.localStorage.setItem(ACTIVE_ORG_KEY, activeOrganizationId);
    } else {
      window.localStorage.removeItem(ACTIVE_ORG_KEY);
    }
  }, [activeOrganizationId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setOrganizations([]);
    setActiveOrganizationId(null);
  }, [supabase]);

  const createOrganization = useCallback(
    async (name: string) => {
      const { error } = await supabase.rpc("create_organization", { p_name: name });

      if (error) {
        return { error };
      }

      const { data } = await supabase.auth.getSession();
      await refreshWorkspace(data.session);
      return { error: null };
    },
    [refreshWorkspace, supabase]
  );

  const setActiveOrganization = useCallback(
    async (organizationId: string) => {
      setActiveOrganizationId(organizationId);
      await supabase.rpc("set_active_organization", { p_organization_id: organizationId });
    },
    [supabase]
  );

  const currentLogin = profile?.login ?? session?.user.email ?? null;

  return {
    session,
    loading,
    profile,
    organizations,
    activeOrganizationId,
    activeOrganization: organizations.find((organization) => organization.id === activeOrganizationId) ?? null,
    currentLogin,
    signOut,
    createOrganization,
    setActiveOrganization,
    refreshWorkspace,
  };
}
