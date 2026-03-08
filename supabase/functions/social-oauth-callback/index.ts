import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  platformUserId: string;
  pageName: string;
  pageId: string;
}

async function exchangeMeta(code: string, redirectUri: string, platform: string): Promise<TokenResult> {
  const metaAppId = Deno.env.get("META_APP_ID")!;
  const metaAppSecret = Deno.env.get("META_APP_SECRET")!;

  const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${metaAppSecret}&code=${code}`);
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error.message);

  // Long-lived token
  const longRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaAppId}&client_secret=${metaAppSecret}&fb_exchange_token=${tokenData.access_token}`);
  const longData = await longRes.json();
  const accessToken = longData.access_token || tokenData.access_token;
  const expiresIn = longData.expires_in || 5184000;

  const meRes = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${accessToken}&fields=id,name`);
  const meData = await meRes.json();
  let platformUserId = meData.id;
  let pageName = meData.name;
  let pageId = "";

  if (platform === "instagram") {
    const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json();
    if (pagesData.data?.[0]) {
      pageId = pagesData.data[0].id;
      const igRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`);
      const igData = await igRes.json();
      if (igData.instagram_business_account?.id) platformUserId = igData.instagram_business_account.id;
    }
  }

  return { accessToken, refreshToken: "", expiresIn, platformUserId, pageName, pageId };
}

async function exchangeThreads(code: string, redirectUri: string): Promise<TokenResult> {
  const metaAppId = Deno.env.get("META_APP_ID")!;
  const metaAppSecret = Deno.env.get("META_APP_SECRET")!;

  const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: metaAppId, client_secret: metaAppSecret, grant_type: "authorization_code", redirect_uri: redirectUri, code }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error?.message || tokenData.error_message || "Threads token error");

  // Long-lived
  const longRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${metaAppSecret}&access_token=${tokenData.access_token}`);
  const longData = await longRes.json();
  const accessToken = longData.access_token || tokenData.access_token;
  const expiresIn = longData.expires_in || 5184000;

  const meRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${accessToken}`);
  const meData = await meRes.json();

  return { accessToken, refreshToken: "", expiresIn, platformUserId: meData.id || "", pageName: meData.username || "", pageId: "" };
}

async function exchangeWhatsApp(code: string, redirectUri: string): Promise<TokenResult> {
  // Uses same Meta OAuth flow
  const result = await exchangeMeta(code, redirectUri, "facebook");
  // Get WhatsApp Business Account
  try {
    const waRes = await fetch(`https://graph.facebook.com/v21.0/me/businesses?access_token=${result.accessToken}`);
    const waData = await waRes.json();
    if (waData.data?.[0]) {
      result.pageName = waData.data[0].name || result.pageName;
      result.platformUserId = waData.data[0].id || result.platformUserId;
    }
  } catch { /* use default */ }
  return result;
}

async function exchangeGoogle(code: string, redirectUri: string, platform: string): Promise<TokenResult> {
  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: googleClientId, client_secret: googleClientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token || "";
  const expiresIn = tokenData.expires_in || 3600;

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
  const userData = await userRes.json();
  let platformUserId = userData.id;
  let pageName = userData.name || userData.email;

  if (platform === "youtube") {
    const channelRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${accessToken}` } });
    const channelData = await channelRes.json();
    if (channelData.items?.[0]) {
      platformUserId = channelData.items[0].id;
      pageName = channelData.items[0].snippet.title;
    }
  }

  return { accessToken, refreshToken, expiresIn, platformUserId, pageName, pageId: "" };
}

async function exchangeTwitter(code: string, redirectUri: string): Promise<TokenResult> {
  const twitterKey = Deno.env.get("TWITTER_CONSUMER_KEY")!;
  const twitterSecret = Deno.env.get("TWITTER_CONSUMER_SECRET")!;

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${btoa(`${twitterKey}:${twitterSecret}`)}` },
    body: new URLSearchParams({ code, grant_type: "authorization_code", redirect_uri: redirectUri, code_verifier: "challenge" }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

  const userRes = await fetch("https://api.x.com/2/users/me", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const userData = await userRes.json();

  return { accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token || "", expiresIn: tokenData.expires_in || 7200, platformUserId: userData.data?.id || "", pageName: userData.data?.username || "", pageId: "" };
}

async function exchangeLinkedIn(code: string, redirectUri: string): Promise<TokenResult> {
  const clientId = Deno.env.get("LINKEDIN_CLIENT_ID")!;
  const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET")!;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const userData = await userRes.json();

  return { accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token || "", expiresIn: tokenData.expires_in || 5184000, platformUserId: userData.sub || "", pageName: userData.name || userData.email || "", pageId: "" };
}

async function exchangeTikTok(code: string, redirectUri: string): Promise<TokenResult> {
  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY")!;
  const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET")!;

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: redirectUri }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error || tokenData.data?.error_code) throw new Error(tokenData.error_description || tokenData.data?.description || "TikTok token error");

  const d = tokenData.data || tokenData;
  return { accessToken: d.access_token, refreshToken: d.refresh_token || "", expiresIn: d.expires_in || 86400, platformUserId: d.open_id || "", pageName: "", pageId: "" };
}

async function exchangePinterest(code: string, redirectUri: string): Promise<TokenResult> {
  const appId = Deno.env.get("PINTEREST_APP_ID")!;
  const appSecret = Deno.env.get("PINTEREST_APP_SECRET")!;

  const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}` },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.message || tokenData.error);

  const userRes = await fetch("https://api.pinterest.com/v5/user_account", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const userData = await userRes.json();

  return { accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token || "", expiresIn: tokenData.expires_in || 2592000, platformUserId: userData.username || "", pageName: userData.username || "", pageId: "" };
}

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

    const { code, state, platform } = await req.json();
    if (!code || !state || !platform) {
      return new Response(JSON.stringify({ error: "code, state, and platform are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify state
    const { data: oauthState, error: stateError } = await supabase
      .from("oauth_states").select("*").eq("state", state).eq("user_id", user.id).eq("platform", platform).single();

    if (stateError || !oauthState) {
      return new Response(JSON.stringify({ error: "Invalid or expired OAuth state" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (new Date(oauthState.expires_at) < new Date()) {
      await supabase.from("oauth_states").delete().eq("id", oauthState.id);
      return new Response(JSON.stringify({ error: "OAuth state expired. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("oauth_states").delete().eq("id", oauthState.id);

    let result: TokenResult;

    switch (platform) {
      case "facebook":
      case "instagram":
        result = await exchangeMeta(code, oauthState.redirect_uri, platform);
        break;
      case "threads":
        result = await exchangeThreads(code, oauthState.redirect_uri);
        break;
      case "whatsapp":
        result = await exchangeWhatsApp(code, oauthState.redirect_uri);
        break;
      case "google":
      case "youtube":
        result = await exchangeGoogle(code, oauthState.redirect_uri, platform);
        break;
      case "twitter":
        result = await exchangeTwitter(code, oauthState.redirect_uri);
        break;
      case "linkedin":
        result = await exchangeLinkedIn(code, oauthState.redirect_uri);
        break;
      case "tiktok":
        result = await exchangeTikTok(code, oauthState.redirect_uri);
        break;
      case "pinterest":
        result = await exchangePinterest(code, oauthState.redirect_uri);
        break;
      default:
        throw new Error(`Platform '${platform}' not supported`);
    }

    const expiresAt = new Date(Date.now() + result.expiresIn * 1000).toISOString();

    const { error: upsertError } = await supabase.from("social_connections").upsert({
      user_id: user.id,
      platform,
      access_token: result.accessToken,
      refresh_token: result.refreshToken || null,
      token_expires_at: expiresAt,
      platform_user_id: result.platformUserId,
      page_name: result.pageName,
      page_id: result.pageId || null,
      is_connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,platform" });

    if (upsertError) {
      await supabase.from("social_connections").update({
        access_token: result.accessToken,
        refresh_token: result.refreshToken || null,
        token_expires_at: expiresAt,
        platform_user_id: result.platformUserId,
        page_name: result.pageName,
        page_id: result.pageId || null,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id).eq("platform", platform);
    }

    console.log(`OAuth callback successful for ${platform}, user: ${user.id}`);

    return new Response(JSON.stringify({ success: true, platform, pageName: result.pageName, platformUserId: result.platformUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in social-oauth-callback:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
