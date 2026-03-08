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
        // Handle platforms that don't support OAuth or missing credentials
        if (data.requiresToken || data.requiresSetup) {
          toast({
            title: "Configuração necessária",
            description: data.error,
          });
          return;
        }
        // Show the specific error from the server (e.g. missing API keys)
        toast({
          title: "Erro de configuração",
          description: data.error || "Erro ao iniciar conexão. Verifique as credenciais nas configurações.",
          variant: "destructive",
        });
        return;
      }

      if (!data.authUrl) {
        toast({
          title: "Erro",
          description: "URL de autenticação não recebida.",
          variant: "destructive",
        });
        return;
      }

      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.authUrl,
        `oauth_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        // Popup blocked — inform user
        toast({
          title: "Popup bloqueado",
          description: "Permita popups para este site e tente novamente. Ou copie o link e abra manualmente.",
          variant: "destructive",
        });
        return;
      }

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "oauth-complete") {
          window.removeEventListener("message", handleMessage);
          fetchConnections();
          toast({
            title: "Conta conectada!",
            description: `${platform} foi conectado com sucesso.`,
          });
        }
      };
      window.addEventListener("message", handleMessage);

      // Poll for popup close
      const pollInterval = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(pollInterval);
            window.removeEventListener("message", handleMessage);
            await fetchConnections();
          }
        } catch {
          // Cross-origin — popup is on external domain
        }
      }, 1000);

      // Safety timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        window.removeEventListener("message", handleMessage);
      }, 300000);

    } catch (error) {
      console.error("OAuth init error:", error);
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Erro desconhecido. Verifique sua conexão.",
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
