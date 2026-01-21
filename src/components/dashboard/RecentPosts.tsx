import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms } from "@/components/icons/SocialIcons";

type PostStatus = "published" | "scheduled" | "draft" | "failed";

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

const mockPosts: Post[] = [
  {
    id: "1",
    content: "🚀 Novo lançamento chegando! Fiquem ligados nas novidades que estão por vir. #inovação #tecnologia",
    platforms: ["facebook", "instagram", "twitter"],
    status: "published",
    publishedAt: "2024-01-15 14:30",
    metrics: { views: 12500, likes: 890, comments: 145, shares: 67 }
  },
  {
    id: "2",
    content: "Participe do nosso webinar ao vivo sobre estratégias de marketing digital. Inscrições abertas!",
    platforms: ["linkedin", "youtube", "facebook"],
    status: "scheduled",
    scheduledFor: "2024-01-20 10:00"
  },
  {
    id: "3",
    content: "Confira nosso novo blog post sobre as tendências de 2024 no mundo digital.",
    platforms: ["twitter", "linkedin"],
    status: "draft"
  },
  {
    id: "4",
    content: "Promoção especial de fim de semana! 50% de desconto em todos os produtos.",
    platforms: ["instagram", "facebook", "whatsapp"],
    status: "failed"
  }
];

const statusConfig = {
  published: {
    icon: CheckCircle2,
    label: "Publicado",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  scheduled: {
    icon: Clock,
    label: "Agendado",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  draft: {
    icon: Loader2,
    label: "Rascunho",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  failed: {
    icon: AlertCircle,
    label: "Falhou",
    color: "text-red-500",
    bg: "bg-red-500/10"
  }
};

export const RecentPosts = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl border border-border"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">Publicações Recentes</h2>
          <button className="text-sm text-primary hover:underline">Ver todas</button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {mockPosts.map((post, index) => {
          const StatusIcon = statusConfig[post.status].icon;
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex -space-x-2">
                  {post.platforms.slice(0, 3).map((platformId) => {
                    const platform = socialPlatforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    const Icon = platform.icon;
                    return (
                      <div
                        key={platformId}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center border-2 border-card",
                          platform.color
                        )}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    );
                  })}
                  {post.platforms.length > 3 && (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border-2 border-card text-xs font-medium">
                      +{post.platforms.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                      statusConfig[post.status].bg,
                      statusConfig[post.status].color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[post.status].label}
                    </span>
                    
                    {post.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {post.publishedAt}
                      </span>
                    )}
                    
                    {post.scheduledFor && (
                      <span className="text-xs text-muted-foreground">
                        Agendado: {post.scheduledFor}
                      </span>
                    )}
                  </div>

                  {post.metrics && (
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        {post.metrics.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3.5 h-3.5" />
                        {post.metrics.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.metrics.comments}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Share2 className="w-3.5 h-3.5" />
                        {post.metrics.shares}
                      </span>
                    </div>
                  )}
                </div>

                <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
