import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, 
  Video, 
  FileText, 
  Calendar, 
  Send, 
  Sparkles,
  Clock,
  Hash,
  Smartphone,
  Monitor,
  X,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { socialPlatforms, SocialPlatformId } from "@/components/icons/SocialIcons";
import { useMediaUpload, type UploadedMedia } from "@/hooks/useMediaUpload";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MediaType = "image" | "video" | "document" | "story" | "live";

const mediaTypes: { id: MediaType; icon: typeof Image; label: string; accept: string }[] = [
  { id: "image", icon: Image, label: "Imagem", accept: "image/*" },
  { id: "video", icon: Video, label: "Vídeo", accept: "video/*" },
  { id: "document", icon: FileText, label: "Documento", accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" },
  { id: "story", icon: Smartphone, label: "Story", accept: "image/*,video/*" },
  { id: "live", icon: Monitor, label: "Live", accept: "video/*" },
];

// Best posting times per platform (based on general research)
const bestPostingTimes: Partial<Record<SocialPlatformId, { day: string; time: string; engagement: string }[]>> = {
  instagram: [
    { day: "Terça", time: "11:00", engagement: "Alto" },
    { day: "Quarta", time: "11:00", engagement: "Alto" },
    { day: "Sexta", time: "10:00-11:00", engagement: "Muito Alto" },
  ],
  facebook: [
    { day: "Terça", time: "09:00", engagement: "Alto" },
    { day: "Quarta", time: "09:00-13:00", engagement: "Muito Alto" },
    { day: "Quinta", time: "09:00", engagement: "Alto" },
  ],
  twitter: [
    { day: "Terça", time: "09:00", engagement: "Alto" },
    { day: "Quarta", time: "09:00", engagement: "Alto" },
    { day: "Quinta", time: "09:00-11:00", engagement: "Muito Alto" },
  ],
  linkedin: [
    { day: "Terça", time: "10:00-12:00", engagement: "Muito Alto" },
    { day: "Quarta", time: "12:00", engagement: "Alto" },
    { day: "Quinta", time: "09:00-10:00", engagement: "Alto" },
  ],
  youtube: [
    { day: "Quinta", time: "15:00-16:00", engagement: "Alto" },
    { day: "Sexta", time: "15:00-16:00", engagement: "Muito Alto" },
    { day: "Sábado", time: "09:00-11:00", engagement: "Alto" },
  ],
  tiktok: [
    { day: "Terça", time: "09:00", engagement: "Alto" },
    { day: "Quinta", time: "12:00", engagement: "Muito Alto" },
    { day: "Sexta", time: "17:00", engagement: "Alto" },
  ],
  pinterest: [
    { day: "Sexta", time: "15:00", engagement: "Alto" },
    { day: "Sábado", time: "20:00-23:00", engagement: "Muito Alto" },
    { day: "Domingo", time: "20:00-23:00", engagement: "Alto" },
  ],
  whatsapp: [
    { day: "Segunda", time: "09:00-12:00", engagement: "Alto" },
    { day: "Quarta", time: "09:00-12:00", engagement: "Alto" },
    { day: "Sexta", time: "09:00-12:00", engagement: "Muito Alto" },
  ],
  telegram: [
    { day: "Segunda", time: "09:00", engagement: "Alto" },
    { day: "Quarta", time: "12:00", engagement: "Alto" },
    { day: "Sexta", time: "09:00", engagement: "Muito Alto" },
  ],
  snapchat: [
    { day: "Sábado", time: "22:00", engagement: "Muito Alto" },
    { day: "Domingo", time: "20:00", engagement: "Alto" },
  ],
  threads: [
    { day: "Terça", time: "11:00", engagement: "Alto" },
    { day: "Quinta", time: "09:00", engagement: "Alto" },
  ],
  site: [
    { day: "Terça", time: "10:00", engagement: "Alto" },
    { day: "Quinta", time: "14:00", engagement: "Alto" },
  ],
};

// Popular hashtags per platform
const popularHashtags: Partial<Record<SocialPlatformId, string[]>> = {
  instagram: ["#instagood", "#photooftheday", "#instadaily", "#love", "#fashion", "#beautiful", "#happy", "#picoftheday", "#style", "#follow"],
  facebook: ["#facebook", "#viral", "#love", "#instagood", "#followme", "#photooftheday", "#fun", "#smile", "#happy", "#friends"],
  twitter: ["#trending", "#viral", "#breaking", "#news", "#tech", "#business", "#marketing", "#socialmedia", "#motivation", "#success"],
  linkedin: ["#business", "#entrepreneur", "#success", "#motivation", "#leadership", "#marketing", "#innovation", "#startup", "#career", "#networking"],
  youtube: ["#youtube", "#viral", "#subscribe", "#video", "#tutorial", "#vlog", "#entertainment", "#music", "#gaming", "#trending"],
  tiktok: ["#fyp", "#foryou", "#foryoupage", "#viral", "#trending", "#tiktok", "#dance", "#funny", "#comedy", "#duet"],
  pinterest: ["#pinterest", "#diy", "#homedecor", "#fashion", "#recipe", "#inspiration", "#wedding", "#art", "#design", "#travel"],
  whatsapp: ["#whatsapp", "#status", "#love", "#quotes", "#motivation", "#funny", "#viral", "#trending", "#life", "#happy"],
  telegram: ["#telegram", "#channel", "#news", "#viral", "#community", "#group", "#updates", "#trending"],
  snapchat: ["#snapchat", "#snap", "#filters", "#story", "#viral", "#fun", "#friends"],
  threads: ["#threads", "#meta", "#viral", "#trending", "#community", "#conversation"],
  site: ["#website", "#blog", "#content", "#digital", "#online", "#web"],
};

export const CreatePostPanel = () => {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [showBestTimes, setShowBestTimes] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, uploading, progress: uploadProgress } = useMediaUpload();
  const { createPost } = useScheduledPosts();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const togglePlatform = (id: SocialPlatformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const media = await uploadMedia(file);
    
    if (media) {
      setUploadedFiles(prev => [...prev, media]);
      toast({
        title: "Arquivo enviado!",
        description: `${file.name} foi carregado com sucesso.`,
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadMedia, toast]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const media = await uploadMedia(file);
    
    if (media) {
      setUploadedFiles(prev => [...prev, media]);
      toast({
        title: "Arquivo enviado!",
        description: `${file.name} foi carregado com sucesso.`,
      });
    }
  }, [uploadMedia, toast]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getAcceptedTypes = () => {
    if (!selectedMedia) return "*/*";
    return mediaTypes.find(t => t.id === selectedMedia)?.accept || "*/*";
  };

  const insertHashtags = (hashtags: string[]) => {
    const hashtagString = hashtags.join(" ");
    setContent(prev => prev + (prev ? "\n\n" : "") + hashtagString);
    setShowHashtags(false);
  };

  const applyBestTime = (day: string, time: string) => {
    // Calculate next occurrence of the day
    const dayMap: Record<string, number> = {
      "Domingo": 0, "Segunda": 1, "Terça": 2, "Quarta": 3,
      "Quinta": 4, "Sexta": 5, "Sábado": 6
    };
    
    const today = new Date();
    const targetDay = dayMap[day];
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    
    // Parse time (handle ranges like "10:00-12:00")
    const timePart = time.split("-")[0].trim();
    const [hours, minutes] = timePart.split(":").map(Number);
    targetDate.setHours(hours, minutes, 0, 0);
    
    // Format for datetime-local input
    const formatted = targetDate.toISOString().slice(0, 16);
    setScheduledDate(formatted);
    setShowBestTimes(false);
    
    toast({
      title: "Horário aplicado!",
      description: `Agendado para ${day} às ${timePart}`,
    });
  };

  const handleSubmit = async (asDraft = false) => {
    if (!content.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Digite o texto do seu post.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Selecione plataformas",
        description: "Escolha pelo menos uma rede social.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = scheduledDate && !asDraft ? new Date(scheduledDate) : undefined;
      
      // Validate scheduled date is in the future
      if (scheduledAt && scheduledAt <= new Date()) {
        toast({
          title: "Data inválida",
          description: "A data de agendamento deve ser no futuro.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const post = await createPost({
        content: content.trim(),
        media_ids: uploadedFiles.map(f => f.id),
        platforms: selectedPlatforms,
        media_type: selectedMedia || "image",
        orientation,
        scheduled_at: scheduledAt,
      });

      if (post) {
        // Add notification
        addNotification({
          type: "success",
          title: asDraft ? "Rascunho salvo" : scheduledAt ? "Post agendado" : "Post criado",
          message: asDraft 
            ? "Seu rascunho foi salvo com sucesso."
            : scheduledAt 
              ? `Seu post será publicado em ${scheduledAt.toLocaleDateString('pt-BR')} às ${scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : "Seu post foi criado com sucesso.",
          platform: selectedPlatforms[0],
        });

        // Reset form
        setContent("");
        setSelectedPlatforms([]);
        setSelectedMedia(null);
        setScheduledDate("");
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      addNotification({
        type: "error",
        title: "Erro ao criar post",
        message: "Não foi possível salvar o post. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const maxCharacters = 5000;

  const selectedHashtags = selectedPlatforms.length > 0
    ? [...new Set(selectedPlatforms.flatMap(p => popularHashtags[p]?.slice(0, 5) || []))]
    : [];

  const selectedBestTimes = selectedPlatforms.map(p => ({
    platform: socialPlatforms.find(sp => sp.id === p),
    times: bestPostingTimes[p] || [],
  })).filter(item => item.times.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Criar Publicação</h2>
              <p className="text-sm text-muted-foreground">
                Publique em múltiplas redes simultaneamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              characterCount > maxCharacters ? "text-destructive" : "text-muted-foreground"
            )}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Selecionar Redes Sociais
          </label>
          <div className="flex flex-wrap gap-2">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <motion.button
                  key={platform.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    platform.color
                  )}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{platform.name}</span>
                  {isSelected && (
                    <X className="w-3 h-3" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Media Type Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Tipo de Mídia
          </label>
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMedia(selectedMedia === type.id ? null : type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                  selectedMedia === type.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50 text-muted-foreground"
                )}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Orientation (for video/story) */}
        <AnimatePresence mode="wait">
          {(selectedMedia === "video" || selectedMedia === "story") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="text-sm font-medium mb-3 block">
                Orientação do Vídeo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrientation("horizontal")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                    orientation === "horizontal"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className="w-6 h-4 border-2 border-current rounded" />
                  <span className="text-sm font-medium">Horizontal</span>
                </button>
                <button
                  onClick={() => setOrientation("vertical")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                    orientation === "vertical"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  <div className="w-4 h-6 border-2 border-current rounded" />
                  <span className="text-sm font-medium">Vertical</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div 
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                    <p className="font-medium">Enviando arquivo...</p>
                    <div className="w-48 mx-auto bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="font-medium mb-1">
                      Arraste e solte ou clique para fazer upload
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Suporta: JPG, PNG, GIF, MP4, PDF, DOCX
                    </p>
                  </>
                )}
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                    >
                      {file.file_type.startsWith("image/") ? (
                        <img 
                          src={file.file_url} 
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : "Tamanho desconhecido"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Textarea */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Conteúdo da Publicação
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua mensagem aqui... Use #hashtags para maior alcance"
            className="min-h-[150px] bg-muted/50 border-border focus:border-primary resize-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <Popover open={showHashtags} onOpenChange={setShowHashtags}>
              <PopoverTrigger asChild>
                <button 
                  disabled={selectedPlatforms.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Hash className="w-4 h-4" />
                  Hashtags
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Hashtags Populares</h4>
                  <p className="text-xs text-muted-foreground">
                    Baseado nas redes selecionadas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHashtags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setContent(prev => prev + " " + tag)}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => insertHashtags(selectedHashtags.slice(0, 5))}
                    className="w-full mt-2"
                  >
                    Inserir Top 5 Hashtags
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Agendamento
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-muted/50 border border-border rounded-xl px-10 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Popover open={showBestTimes} onOpenChange={setShowBestTimes}>
              <PopoverTrigger asChild>
                <button 
                  disabled={selectedPlatforms.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="w-4 h-4" />
                  Melhor Horário
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Melhores Horários para Publicação</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique em um horário para aplicar
                    </p>
                  </div>
                  
                  {selectedBestTimes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Selecione pelo menos uma rede social
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {selectedBestTimes.map(({ platform, times }) => (
                        platform && (
                          <div key={platform.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-5 h-5 rounded flex items-center justify-center",
                                platform.color
                              )}>
                                <platform.icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">{platform.name}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 pl-7">
                              {times.map((time, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => applyBestTime(time.day, time.time)}
                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{time.day}</span>
                                    <span className="text-xs text-muted-foreground">{time.time}</span>
                                  </div>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    time.engagement === "Muito Alto" 
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-blue-500/10 text-blue-500"
                                  )}>
                                    {time.engagement}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {scheduledDate && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Agendado para: {new Date(scheduledDate).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedPlatforms.length} redes selecionadas
            {uploadedFiles.length > 0 && ` • ${uploadedFiles.length} arquivo(s)`}
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-border"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Rascunho
            </Button>
            <Button 
              disabled={isSubmitting || !content.trim() || selectedPlatforms.length === 0}
              onClick={() => handleSubmit(false)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {scheduledDate ? "Agendar" : "Publicar Agora"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
