import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SocialConnection {
  id: string;
  platform: string;
  is_connected: boolean;
  page_name: string | null;
  platform_user_id: string | null;
  token_expires_at: string | null;
  page_id: string | null;
}

export function useSocialConnections() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!user) return;

    try {
      // Use safe columns only (no tokens)
      const { data, error } = await supabase
        .from('social_connections')
        .select('id, platform, is_connected, page_name, platform_user_id, token_expires_at, page_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setConnections((data || []) as unknown as SocialConnection[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const initiateOAuth = async (platform: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("oauth_platform", platform);

      const redirectUri = `${window.location.origin}/oauth/callback?platform=${platform}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-oauth-init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ platform, redirect_uri: redirectUri }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar OAuth");
      }

      // Redirect to auth URL
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("OAuth init error:", error);
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const disconnect = async (platform: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ 
          is_connected: false, 
          access_token: null, 
          refresh_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      await fetchConnections();

      toast({
        title: "Conta desconectada",
        description: `${platform} foi desconectado.`,
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  return {
    connections,
    loading,
    initiateOAuth,
    disconnect,
    refetch: fetchConnections,
  };
}
