import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { postId, platforms, content, mediaUrls } = await req.json();

    if (!postId || !platforms || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: postId, platforms, content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get social connections for the user
    const { data: connections, error: connError } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_connected", true);

    if (connError) {
      console.error("Error fetching connections:", connError);
      throw new Error("Failed to fetch social connections");
    }

    const results: PublishResult[] = [];

    for (const platform of platforms) {
      const connection = connections?.find(c => c.platform === platform);

      if (!connection || !connection.access_token) {
        results.push({
          platform,
          success: false,
          error: `Conta ${platform} não conectada. Vá em Configurações para conectar.`,
        });
        continue;
      }

      // Check if token is expired
      if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
        results.push({
          platform,
          success: false,
          error: `Token expirado para ${platform}. Reconecte sua conta.`,
        });
        continue;
      }

      try {
        // Platform-specific publishing logic
        // Note: Real implementation would call actual platform APIs
        // This is a simulation since we don't have real API credentials yet
        
        console.log(`Publishing to ${platform}:`, { content: content.substring(0, 50), mediaUrls });
        
        // Simulate API call based on platform
        const publishResult = await simulatePublish(platform, content, mediaUrls, connection);
        
        results.push({
          platform,
          success: publishResult.success,
          postId: publishResult.postId,
          error: publishResult.error,
        });
      } catch (err) {
        console.error(`Error publishing to ${platform}:`, err);
        results.push({
          platform,
          success: false,
          error: err instanceof Error ? err.message : "Unknown publishing error",
        });
      }
    }

    // Update post status based on results
    const allSucceeded = results.every(r => r.success);
    const anySucceeded = results.some(r => r.success);
    const errors = results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (allSucceeded) {
      updateData.status = "published";
      updateData.published_at = new Date().toISOString();
      updateData.error_message = null;
    } else if (anySucceeded) {
      updateData.status = "published";
      updateData.published_at = new Date().toISOString();
      updateData.error_message = `Parcialmente publicado. Falhas: ${errors.join("; ")}`;
    } else {
      updateData.status = "failed";
      updateData.error_message = errors.join("; ");
    }

    await supabase
      .from("scheduled_posts")
      .update(updateData)
      .eq("id", postId)
      .eq("user_id", user.id);

    console.log("Publishing complete:", { postId, results });

    return new Response(JSON.stringify({ results, summary: updateData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in publish-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simulate publishing to different platforms
async function simulatePublish(
  platform: string, 
  content: string, 
  mediaUrls: string[], 
  connection: { access_token: string; page_id?: string }
): Promise<{ success: boolean; postId?: string; error?: string }> {
  // In a real implementation, this would call the actual platform APIs
  // For now, we simulate success with some random failures to test error handling
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Platform-specific validations
  if (platform === "twitter" && content.length > 280) {
    return { success: false, error: "Texto excede 280 caracteres para Twitter" };
  }
  
  if (platform === "instagram" && content.length > 2200) {
    return { success: false, error: "Texto excede 2200 caracteres para Instagram" };
  }
  
  if ((platform === "instagram" || platform === "pinterest") && mediaUrls.length === 0) {
    return { success: false, error: `${platform} requer pelo menos uma imagem` };
  }
  
  // Generate a mock post ID
  const mockPostId = `${platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  console.log(`[SIMULATED] Published to ${platform}:`, mockPostId);
  
  return { success: true, postId: mockPostId };
}
