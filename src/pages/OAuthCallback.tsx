import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("Processando autenticação...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const platform = searchParams.get("platform") || localStorage.getItem("oauth_platform") || "";

      if (!code || !state) {
        toast({
          title: "Erro de autenticação",
          description: "Parâmetros OAuth inválidos.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        setStatus("Trocando código por token...");

        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error("Sessão expirada");
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-oauth-callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.session.access_token}`,
            },
            body: JSON.stringify({ code, state, platform }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha na autenticação");
        }

        localStorage.removeItem("oauth_platform");

        toast({
          title: "Conta conectada!",
          description: `${data.pageName || platform} foi conectado com sucesso.`,
        });
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Erro ao conectar",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }

      navigate("/dashboard");
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-muted-foreground">Aguarde enquanto processamos...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
