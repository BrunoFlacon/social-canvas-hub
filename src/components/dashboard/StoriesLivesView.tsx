import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Radio, Video, Clock, Plus, Play, Eye, Heart, MessageCircle, Calendar, Trash2, X, Upload, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms, SocialPlatformId } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface StoryLive {
  id: string;
  user_id: string;
  type: string;
  platform: string;
  title: string;
  content: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
  viewers: number;
  likes: number;
  comments: number;
  created_at: string;
}

const storyPlatforms: SocialPlatformId[] = ["instagram", "facebook", "whatsapp", "snapchat"];
const livePlatforms: SocialPlatformId[] = ["youtube", "instagram", "tiktok", "facebook"];

export const StoriesLivesView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<StoryLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<"story" | "live">("story");
  const [formTitle, setFormTitle] = useState("");
  const [formPlatform, setFormPlatform] = useState<string>("");
  const [formContent, setFormContent] = useState("");
  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("stories_lives")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as unknown as StoryLive[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("stories-lives-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories_lives", filter: `user_id=eq.${user.id}` }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingThumb(true);
    const ext = file.name.split(".").pop();
    const path = `stories/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      setThumbnailUrl(urlData.publicUrl);
    }
    setUploadingThumb(false);
  };

  const handleCreate = async () => {
    if (!user || !formTitle.trim() || !formPlatform) return;
    setSubmitting(true);
    const { error } = await supabase.from("stories_lives").insert({
      user_id: user.id,
      type: createType,
      platform: formPlatform,
      title: formTitle.trim(),
      content: formContent.trim() || null,
      thumbnail_url: thumbnailUrl || null,
      status: formScheduledAt ? "scheduled" : "draft",
      scheduled_at: formScheduledAt ? new Date(formScheduledAt).toISOString() : null,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: createType === "story" ? "Story criado!" : "Live agendada!" });
      setShowCreateDialog(false);
      resetForm();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("stories_lives").delete().eq("id", id);
    toast({ title: "Removido com sucesso" });
  };

  const resetForm = () => {
    setFormTitle(""); setFormPlatform(""); setFormContent(""); setFormScheduledAt(""); setThumbnailUrl("");
  };

  const stories = items.filter(i => i.type === "story");
  const lives = items.filter(i => i.type === "live");

  const openCreate = (type: "story" | "live") => {
    setCreateType(type);
    resetForm();
    setShowCreateDialog(true);
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "published": return "Publicado";
      case "scheduled": return "Agendado";
      case "completed": return "Concluída";
      default: return "Rascunho";
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "published": case "completed": return "bg-green-500/20 text-green-400";
      case "scheduled": return "bg-blue-500/20 text-blue-400";
      default: return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const platformOptions = createType === "story" ? storyPlatforms : livePlatforms;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Stories & Lives</h1>
        <p className="text-muted-foreground">Gerencie seus stories e transmissões ao vivo</p>
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
              <p className="text-sm text-muted-foreground">Conteúdo efêmero para Instagram, Facebook e WhatsApp</p>
            </div>
          </div>
          <Button onClick={() => openCreate("story")} className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" /> Novo Story
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story, index) => {
              const platform = socialPlatforms.find(p => p.id === story.platform);
              const Icon = platform?.icon;
              return (
                <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-primary/30 transition-all relative"
                >
                  <div className="relative aspect-[9/16] max-h-[280px]">
                    {story.thumbnail_url ? (
                      <img src={story.thumbnail_url} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center"><Radio className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform?.color)}>
                        {Icon && <Icon className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-md text-xs font-medium", statusColor(story.status))}>{statusLabel(story.status)}</span>
                      <button onClick={() => handleDelete(story.id)} className="p-1 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 hover:bg-destructive/60 transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-medium text-white text-sm">{story.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {story.viewers > 0 && <span className="flex items-center gap-1 text-white/70 text-xs"><Eye className="w-3 h-3" />{story.viewers.toLocaleString()}</span>}
                        {story.scheduled_at && <span className="flex items-center gap-1 text-white/70 text-xs"><Clock className="w-3 h-3" />{new Date(story.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              onClick={() => openCreate("story")}
              className="glass-card rounded-2xl border border-dashed border-border aspect-[9/16] max-h-[280px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all group"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Criar Story</p>
              </div>
            </motion.div>
          </div>
        )}
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
              <p className="text-sm text-muted-foreground">Transmissões ao vivo para YouTube, Instagram e TikTok</p>
            </div>
          </div>
          <Button onClick={() => openCreate("live")} className="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white gap-2">
            <Plus className="w-4 h-4" /> Agendar Live
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lives.map((live, index) => {
              const platform = socialPlatforms.find(p => p.id === live.platform);
              const Icon = platform?.icon;
              return (
                <motion.div key={live.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="relative aspect-video">
                    {live.thumbnail_url ? (
                      <img src={live.thumbnail_url} alt={live.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center"><Video className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform?.color)}>
                        {Icon && <Icon className="w-4 h-4 text-white" />}
                      </div>
                      <span className={cn("px-2 py-1 rounded-md text-xs font-medium", statusColor(live.status))}>{statusLabel(live.status)}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button onClick={() => handleDelete(live.id)} className="p-1 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 hover:bg-destructive/60 transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
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
                      {live.scheduled_at && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(live.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      )}
                      {live.viewers > 0 && <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{live.viewers.toLocaleString()}</span>}
                      {live.likes > 0 && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{live.likes}</span>}
                      {live.comments > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{live.comments}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {lives.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma live ainda</p>
                <p className="text-sm mt-1">Clique em "Agendar Live" para criar sua primeira transmissão</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{createType === "story" ? "Criar Story" : "Agendar Live"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={createType === "story" ? "Título do story" : "Título da live"} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Plataforma</label>
              <Select value={formPlatform} onValueChange={setFormPlatform}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {platformOptions.map(pid => {
                    const p = socialPlatforms.find(sp => sp.id === pid);
                    return p ? <SelectItem key={pid} value={pid}>{p.name}</SelectItem> : null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição (opcional)</label>
              <Textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Descreva o conteúdo..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Agendar para (opcional)</label>
              <Input type="datetime-local" value={formScheduledAt} onChange={e => setFormScheduledAt(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Thumbnail (opcional)</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              {thumbnailUrl ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                  <img src={thumbnailUrl} className="w-full h-full object-cover" />
                  <button onClick={() => setThumbnailUrl("")} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full"><X className="w-3 h-3 text-white" /></button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingThumb}>
                  {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={submitting || !formTitle.trim() || !formPlatform}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {createType === "story" ? "Criar Story" : "Agendar Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
