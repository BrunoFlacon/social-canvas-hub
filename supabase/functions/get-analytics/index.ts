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

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "7d";
    const platform = url.searchParams.get("platform") || "all";

    // Get posts data
    const { data: posts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (postsError) {
      throw new Error("Failed to fetch posts");
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Filter posts by date range
    const filteredPosts = posts?.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate >= startDate;
    }) || [];

    // Filter by platform if specified
    const platformPosts = platform === "all" 
      ? filteredPosts 
      : filteredPosts.filter(post => post.platforms?.includes(platform));

    // Calculate analytics
    const totalPosts = platformPosts.length;
    const publishedPosts = platformPosts.filter(p => p.status === "published").length;
    const scheduledPosts = platformPosts.filter(p => p.status === "scheduled").length;
    const failedPosts = platformPosts.filter(p => p.status === "failed").length;
    const draftPosts = platformPosts.filter(p => p.status === "draft").length;

    // Generate simulated engagement data (in real app, this would come from platform APIs)
    const generateEngagementData = (postCount: number) => {
      const baseViews = postCount * 150 + Math.floor(Math.random() * 500);
      const baseLikes = Math.floor(baseViews * (0.05 + Math.random() * 0.1));
      const baseComments = Math.floor(baseLikes * (0.1 + Math.random() * 0.2));
      const baseShares = Math.floor(baseLikes * (0.05 + Math.random() * 0.15));
      const baseReach = baseViews * (1.2 + Math.random() * 0.5);

      return {
        views: baseViews,
        likes: baseLikes,
        comments: baseComments,
        shares: baseShares,
        reach: Math.floor(baseReach),
        engagementRate: ((baseLikes + baseComments + baseShares) / baseViews * 100).toFixed(2),
      };
    };

    const engagement = generateEngagementData(publishedPosts);

    // Generate daily chart data
    const getDaysInPeriod = () => {
      switch (period) {
        case "24h": return 24; // hours
        case "7d": return 7;
        case "30d": return 30;
        case "90d": return 90;
        default: return 7;
      }
    };

    const days = getDaysInPeriod();
    const chartData = [];
    const isHourly = period === "24h";

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (isHourly) {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      const label = isHourly 
        ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });

      // Simulate varying engagement throughout the period
      const multiplier = 0.5 + Math.random();
      
      chartData.push({
        name: label,
        views: Math.floor((engagement.views / days) * multiplier),
        engagement: Math.floor((engagement.likes + engagement.comments) / days * multiplier),
        reach: Math.floor((engagement.reach / days) * multiplier),
      });
    }

    // Platform breakdown
    const platformBreakdown: Record<string, { posts: number; engagement: number }> = {};
    const allPlatforms = new Set<string>();
    
    platformPosts.forEach(post => {
      post.platforms?.forEach((p: string) => {
        allPlatforms.add(p);
        if (!platformBreakdown[p]) {
          platformBreakdown[p] = { posts: 0, engagement: 0 };
        }
        platformBreakdown[p].posts++;
        // Simulate engagement per platform
        platformBreakdown[p].engagement += Math.floor(Math.random() * 500 + 100);
      });
    });

    // Top performing content (based on simulated data)
    const topContent = platformPosts
      .filter(p => p.status === "published")
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        content: post.content.substring(0, 100),
        platforms: post.platforms,
        engagement: Math.floor(Math.random() * 1000 + 200),
        views: Math.floor(Math.random() * 5000 + 500),
        publishedAt: post.published_at,
      }));

    // Best posting times analysis
    const bestTimes = [
      { day: "Terça", time: "11:00", engagement: 85 },
      { day: "Quarta", time: "09:00", engagement: 82 },
      { day: "Quinta", time: "14:00", engagement: 78 },
      { day: "Sexta", time: "10:00", engagement: 75 },
      { day: "Segunda", time: "12:00", engagement: 72 },
    ];

    const analytics = {
      overview: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        failedPosts,
        draftPosts,
        publishRate: totalPosts > 0 ? ((publishedPosts / totalPosts) * 100).toFixed(1) : 0,
      },
      engagement: {
        ...engagement,
        growth: ((Math.random() - 0.3) * 20).toFixed(1), // -6% to +14%
      },
      chartData,
      platformBreakdown,
      topContent,
      bestTimes,
      period,
      generatedAt: new Date().toISOString(),
    };

    console.log("Analytics generated for user:", user.id, { period, platform });

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-analytics:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
