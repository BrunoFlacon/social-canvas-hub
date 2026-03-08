import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { platform, redirect_uri } = await req.json();
    if (!platform || !redirect_uri) {
      return new Response(JSON.stringify({ error: "platform and redirect_uri are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate cryptographic state
    const stateBytes = new Uint8Array(32);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    await supabase.from("oauth_states").insert({ user_id: user.id, platform, state, redirect_uri });

    let authUrl = "";

    switch (platform) {
      case "facebook":
      case "instagram": {
        const metaAppId = Deno.env.get("META_APP_ID");
        if (!metaAppId) return new Response(JSON.stringify({ error: "META_APP_ID not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = platform === "instagram"
          ? "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement"
          : "pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata";
        authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "threads": {
        const metaAppId = Deno.env.get("META_APP_ID");
        if (!metaAppId) return new Response(JSON.stringify({ error: "META_APP_ID not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = "threads_basic,threads_content_publish,threads_manage_insights";
        authUrl = `https://www.threads.net/oauth/authorize?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "whatsapp": {
        const metaAppId = Deno.env.get("META_APP_ID");
        if (!metaAppId) return new Response(JSON.stringify({ error: "META_APP_ID not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = "whatsapp_business_management,whatsapp_business_messaging,business_management";
        authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "google":
      case "youtube": {
        const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
        if (!googleClientId) return new Response(JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = platform === "youtube"
          ? "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube"
          : "https://www.googleapis.com/auth/business.manage";
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent`;
        break;
      }
      case "twitter": {
        const twitterKey = Deno.env.get("TWITTER_CONSUMER_KEY");
        if (!twitterKey) return new Response(JSON.stringify({ error: "TWITTER_CONSUMER_KEY not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterKey}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
        break;
      }
      case "linkedin": {
        const linkedinId = Deno.env.get("LINKEDIN_CLIENT_ID");
        if (!linkedinId) return new Response(JSON.stringify({ error: "LINKEDIN_CLIENT_ID not configured. Add it in project secrets." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = "openid profile email w_member_social";
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
        break;
      }
      case "tiktok": {
        const tiktokKey = Deno.env.get("TIKTOK_CLIENT_KEY");
        if (!tiktokKey) return new Response(JSON.stringify({ error: "TIKTOK_CLIENT_KEY not configured. Add it in project secrets." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = "user.info.basic,video.publish,video.upload";
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${tiktokKey}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "pinterest": {
        const pinterestId = Deno.env.get("PINTEREST_APP_ID");
        if (!pinterestId) return new Response(JSON.stringify({ error: "PINTEREST_APP_ID not configured. Add it in project secrets." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const scopes = "boards:read,pins:read,pins:write,user_accounts:read";
        authUrl = `https://www.pinterest.com/oauth/?client_id=${pinterestId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "telegram": {
        // Telegram uses Bot Token, not OAuth. Return instruction.
        return new Response(JSON.stringify({ 
          error: "Telegram usa Bot Token. Configure o TELEGRAM_BOT_TOKEN nos secrets do projeto e adicione o bot ao seu grupo/canal.",
          requiresToken: true 
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      case "snapchat": {
        return new Response(JSON.stringify({ 
          error: "Snapchat requer credenciais Snap Kit. Configure SNAPCHAT_CLIENT_ID nos secrets do projeto.",
          requiresSetup: true 
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      default:
        return new Response(JSON.stringify({ error: `Platform '${platform}' not supported for OAuth` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ authUrl, state }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in social-oauth-init:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
