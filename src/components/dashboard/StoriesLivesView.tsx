import { motion } from "framer-motion";
import { 
  Radio, 
  Video, 
  Clock, 
  Plus, 
  Play, 
  Eye,
  Heart,
  MessageCircle,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";

const mockStories = [
  {
    id: "1",
    platform: "instagram",
    title: "Bastidores do produto",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    status: "scheduled",
    scheduledFor: "Hoje, 14:00",
    views: 0
  },
  {
    id: "2",
    platform: "facebook",
    title: "Promoção relâmpago",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
    status: "published",
    publishedAt: "Ontem, 18:30",
    views: 1250
  },
  {
    id: "3",
    platform: "whatsapp",
    title: "Status do dia",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    status: "draft",
    views: 0
  },
];

const mockLives = [
  {
    id: "1",
    platform: "youtube",
    title: "Live de lançamento do produto",
    thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
    status: "scheduled",
    scheduledFor: "20 Jan, 19:00",
    expectedViewers: "500+"
  },
  {
    id: "2",
    platform: "instagram",
    title: "Q&A com a equipe",
    thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400",
    status: "scheduled",
    scheduledFor: "22 Jan, 15:00",
    expectedViewers: "300+"
  },
  {
    id: "3",
    platform: "tiktok",
    title: "Tutorial ao vivo",
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
    status: "completed",
    completedAt: "15 Jan, 18:00",
    viewers: 2340,
    likes: 892,
    comments: 145
  },
];

export const StoriesLivesView = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Stories & Lives</h1>
        <p className="text-muted-foreground">
          Gerencie seus stories e transmissões ao vivo
        </p>
      </div>

      {/* Stories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Stories</h2>
              <p className="text-sm text-muted-foreground">
                Conteúdo efêmero para Instagram, Facebook e WhatsApp
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Novo Story
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStories.map((story, index) => {
            const platform = socialPlatforms.find(p => p.id === story.platform);
            const Icon = platform?.icon;
            
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="relative aspect-[9/16] max-h-[280px]">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      platform?.color
                    )}>
                      {Icon && <Icon className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      story.status === "published" && "bg-green-500/20 text-green-400",
                      story.status === "scheduled" && "bg-blue-500/20 text-blue-400",
                      story.status === "draft" && "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {story.status === "published" ? "Publicado" : 
                       story.status === "scheduled" ? "Agendado" : "Rascunho"}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-medium text-white text-sm">{story.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {story.views > 0 && (
                        <span className="flex items-center gap-1 text-white/70 text-xs">
                          <Eye className="w-3 h-3" />
                          {story.views.toLocaleString()}
                        </span>
                      )}
                      {story.scheduledFor && (
                        <span className="flex items-center gap-1 text-white/70 text-xs">
                          <Clock className="w-3 h-3" />
                          {story.scheduledFor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Story Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl border border-dashed border-border aspect-[9/16] max-h-[280px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all group"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Criar Story
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lives Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Lives</h2>
              <p className="text-sm text-muted-foreground">
                Transmissões ao vivo para YouTube, Instagram e TikTok
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" />
            Agendar Live
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockLives.map((live, index) => {
            const platform = socialPlatforms.find(p => p.id === live.platform);
            const Icon = platform?.icon;
            
            return (
              <motion.div
                key={live.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="relative aspect-video">
                  <img
                    src={live.thumbnail}
                    alt={live.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      platform?.color
                    )}>
                      {Icon && <Icon className="w-4 h-4 text-white" />}
                    </div>
                    {live.status === "completed" && (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                        Concluída
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-7 h-7 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-medium mb-2">{live.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {live.scheduledFor && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {live.scheduledFor}
                      </span>
                    )}
                    {live.expectedViewers && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {live.expectedViewers} esperados
                      </span>
                    )}
                    {live.viewers && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {live.viewers.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {live.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {live.comments}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
