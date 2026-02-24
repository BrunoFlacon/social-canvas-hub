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
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform, redirect_uri } = await req.json();

    if (!platform || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: "platform and redirect_uri are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate cryptographic state
    const stateBytes = new Uint8Array(32);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Store state in DB
    await supabase.from("oauth_states").insert({
      user_id: user.id,
      platform,
      state,
      redirect_uri,
    });

    let authUrl = "";

    switch (platform) {
      case "facebook":
      case "instagram": {
        const metaAppId = Deno.env.get("META_APP_ID");
        if (!metaAppId) {
          return new Response(
            JSON.stringify({ error: "META_APP_ID not configured. Add it in project secrets." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const scopes = platform === "instagram"
          ? "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement"
          : "pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata";
        authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${scopes}&response_type=code`;
        break;
      }
      case "google":
      case "youtube": {
        const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
        if (!googleClientId) {
          return new Response(
            JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured. Add it in project secrets." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const scopes = platform === "youtube"
          ? "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube"
          : "https://www.googleapis.com/auth/business.manage";
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent`;
        break;
      }
      case "twitter": {
        const twitterKey = Deno.env.get("TWITTER_CONSUMER_KEY");
        if (!twitterKey) {
          return new Response(
            JSON.stringify({ error: "TWITTER_CONSUMER_KEY not configured. Add it in project secrets." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterKey}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: `Platform '${platform}' not supported for OAuth` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify({ authUrl, state }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in social-oauth-init:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
