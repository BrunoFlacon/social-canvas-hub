import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PlatformCredentials {
  platform: string;
  credentials: Record<string, string>;
}

export const PLATFORM_CREDENTIAL_FIELDS: Record<string, { label: string; key: string; masked?: boolean }[]> = {
  facebook: [
    { label: "App ID", key: "app_id" },
    { label: "App Secret", key: "app_secret", masked: true },
  ],
  instagram: [
    { label: "App ID (Meta)", key: "app_id" },
    { label: "App Secret (Meta)", key: "app_secret", masked: true },
  ],
  threads: [
    { label: "App ID (Meta)", key: "app_id" },
    { label: "App Secret (Meta)", key: "app_secret", masked: true },
  ],
  whatsapp: [
    { label: "App ID (Meta)", key: "app_id" },
    { label: "App Secret (Meta)", key: "app_secret", masked: true },
  ],
  twitter: [
    { label: "Consumer Key", key: "consumer_key" },
    { label: "Consumer Secret", key: "consumer_secret", masked: true },
  ],
  youtube: [
    { label: "Client ID (Google)", key: "client_id" },
    { label: "Client Secret (Google)", key: "client_secret", masked: true },
  ],
  google: [
    { label: "Client ID", key: "client_id" },
    { label: "Client Secret", key: "client_secret", masked: true },
  ],
  linkedin: [
    { label: "Client ID", key: "client_id" },
    { label: "Client Secret", key: "client_secret", masked: true },
  ],
  tiktok: [
    { label: "Client Key", key: "client_key" },
    { label: "Client Secret", key: "client_secret", masked: true },
  ],
  pinterest: [
    { label: "App ID", key: "app_id" },
    { label: "App Secret", key: "app_secret", masked: true },
  ],
  telegram: [
    { label: "Bot Token", key: "bot_token", masked: true },
  ],
  snapchat: [
    { label: "Client ID", key: "client_id" },
    { label: "Client Secret", key: "client_secret", masked: true },
  ],
  site: [
    { label: "URL do Site", key: "site_url" },
  ],
};

export function useApiCredentials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("api_credentials" as any)
        .select("platform, credentials")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: Record<string, Record<string, string>> = {};
      (data as any[])?.forEach((row: any) => {
        map[row.platform] = row.credentials || {};
      });
      setCredentials(map);
    } catch (e: any) {
      console.error("Error fetching credentials:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const saveCredentials = async (platform: string, creds: Record<string, string>) => {
    if (!user) return false;
    setSaving(platform);
    try {
      const { error } = await supabase
        .from("api_credentials" as any)
        .upsert(
          { user_id: user.id, platform, credentials: creds } as any,
          { onConflict: "user_id,platform" }
        );
      if (error) throw error;
      setCredentials(prev => ({ ...prev, [platform]: creds }));
      toast({ title: "Credenciais salvas", description: `${platform} atualizado com sucesso.` });
      return true;
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
      return false;
    } finally {
      setSaving(null);
    }
  };

  const deleteCredentials = async (platform: string) => {
    if (!user) return false;
    setSaving(platform);
    try {
      const { error } = await supabase
        .from("api_credentials" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("platform", platform);
      if (error) throw error;
      setCredentials(prev => {
        const next = { ...prev };
        delete next[platform];
        return next;
      });
      toast({ title: "Credenciais removidas", description: `${platform} removido.` });
      return true;
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" });
      return false;
    } finally {
      setSaving(null);
    }
  };

  const hasCredentials = (platform: string) => {
    const creds = credentials[platform];
    if (!creds) return false;
    return Object.values(creds).some(v => v && v.trim() !== "");
  };

  return { credentials, loading, saving, saveCredentials, deleteCredentials, hasCredentials, refetch: fetchCredentials };
}
