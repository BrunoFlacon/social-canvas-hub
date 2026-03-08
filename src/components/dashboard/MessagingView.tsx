import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Plus, Trash2, Send, Users, Radio as BroadcastIcon, Hash, User, Loader2, Clock, CheckCircle2, AlertCircle, Phone, Search, Filter, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MessagingChannel {
  id: string;
  user_id: string;
  platform: string;
  channel_name: string;
  channel_id: string | null;
  channel_type: string;
  members_count: number;
  created_at: string;
}

interface Message {
  id: string;
  user_id: string;
  channel_id: string | null;
  content: string;
  media_url: string | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_phone: string | null;
  recipient_name: string | null;
  platform: string | null;
  created_at: string;
}

// Platform configs with allowed channel types
const messagingPlatformConfigs = [
  { id: "whatsapp", name: "WhatsApp", types: ["group", "broadcast", "community", "individual"] },
  { id: "telegram", name: "Telegram", types: ["group", "channel", "community", "individual"] },
  { id: "facebook", name: "Facebook", types: ["group", "broadcast"] },
  { id: "instagram", name: "Instagram", types: ["broadcast"] },
  { id: "linkedin", name: "LinkedIn", types: ["group"] },
  { id: "twitter", name: "X (Twitter)", types: ["group"] },
  { id: "threads", name: "Threads", types: ["broadcast"] },
  { id: "custom", name: "Outra rede", types: ["group", "broadcast", "channel", "community", "individual"] },
];

const channelTypes = [
  { id: "group", label: "Grupo", icon: Users },
  { id: "broadcast", label: "Lista/Canal de Transmissão", icon: BroadcastIcon },
  { id: "channel", label: "Canal", icon: Hash },
  { id: "community", label: "Comunidade", icon: Hash },
  { id: "individual", label: "Individual", icon: User },
];

const messageStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Rascunho", color: "text-yellow-500", icon: Clock },
  scheduled: { label: "Agendada", color: "text-blue-500", icon: Calendar },
  sent: { label: "Enviada", color: "text-green-500", icon: CheckCircle2 },
  failed: { label: "Falhou", color: "text-red-500", icon: AlertCircle },
};

export const MessagingView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<MessagingChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("channels");

  // Add channel form
  const [formPlatform, setFormPlatform] = useState("");
  const [formCustomPlatform, setFormCustomPlatform] = useState("");
  const [formChannelName, setFormChannelName] = useState("");
  const [formChannelId, setFormChannelId] = useState("");
  const [formChannelType, setFormChannelType] = useState("group");
  const [formMembersCount, setFormMembersCount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Compose form
  const [composeTarget, setComposeTarget] = useState<string[]>([]);
  const [composeMessage, setComposeMessage] = useState("");
  const [composeScheduledAt, setComposeScheduledAt] = useState("");
  const [composeIndividualPhone, setComposeIndividualPhone] = useState("");
  const [composeIndividualName, setComposeIndividualName] = useState("");
  const [composeIndividualPlatform, setComposeIndividualPlatform] = useState("whatsapp");
  const [composeSending, setComposeSending] = useState(false);
  const [sendMode, setSendMode] = useState<"channels" | "individual">("channels");

  // History filters
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");

  const fetchChannels = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("messaging_channels")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setChannels(data as unknown as MessagingChannel[]);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setMessages(data as unknown as Message[]);
    setMessagesLoading(false);
  };

  useEffect(() => {
    fetchChannels();
    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch1 = supabase
      .channel("messaging-channels-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "messaging_channels", filter: `user_id=eq.${user.id}` }, () => fetchChannels())
      .subscribe();
    const ch2 = supabase
      .channel("messages-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [user]);

  const availableTypes = formPlatform
    ? messagingPlatformConfigs.find(p => p.id === formPlatform)?.types || []
    : [];

  const handleAddChannel = async () => {
    if (!user || !formPlatform || !formChannelName.trim()) return;
    setSubmitting(true);
    const platformName = formPlatform === "custom" ? formCustomPlatform.trim() || "custom" : formPlatform;
    const { error } = await supabase.from("messaging_channels").insert({
      user_id: user.id,
      platform: platformName,
      channel_name: formChannelName.trim(),
      channel_id: formChannelId.trim() || null,
      channel_type: formChannelType,
      members_count: parseInt(formMembersCount) || 0,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Canal adicionado!" });
      setShowAddDialog(false);
      resetAddForm();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("messaging_channels").delete().eq("id", id);
    toast({ title: "Canal removido" });
  };

  const resetAddForm = () => {
    setFormPlatform(""); setFormCustomPlatform(""); setFormChannelName(""); setFormChannelId(""); setFormChannelType("group"); setFormMembersCount("");
  };

  const toggleComposeTarget = (id: string) => {
    setComposeTarget(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSendMessage = async () => {
    if (!user) return;
    setComposeSending(true);

    try {
      if (sendMode === "individual") {
        if (!composeIndividualPhone.trim() || !composeMessage.trim()) return;
        const { error } = await supabase.from("messages").insert({
          user_id: user.id,
          content: composeMessage.trim(),
          status: composeScheduledAt ? "scheduled" : "draft",
          scheduled_at: composeScheduledAt || null,
          recipient_phone: composeIndividualPhone.trim(),
          recipient_name: composeIndividualName.trim() || null,
          platform: composeIndividualPlatform,
        } as any);
        if (error) throw error;
        toast({ title: composeScheduledAt ? "Mensagem agendada!" : "Rascunho salvo!", description: `Para: ${composeIndividualPhone}` });
      } else {
        if (composeTarget.length === 0 || !composeMessage.trim()) return;
        const inserts = composeTarget.map(channelId => {
          const ch = channels.find(c => c.id === channelId);
          return {
            user_id: user.id,
            channel_id: channelId,
            content: composeMessage.trim(),
            status: composeScheduledAt ? "scheduled" : "draft",
            scheduled_at: composeScheduledAt || null,
            platform: ch?.platform || null,
          };
        });
        const { error } = await supabase.from("messages").insert(inserts as any);
        if (error) throw error;
        const targetNames = channels.filter(c => composeTarget.includes(c.id)).map(c => c.channel_name).join(", ");
        toast({ title: composeScheduledAt ? "Mensagens agendadas!" : "Rascunhos salvos!", description: `Para: ${targetNames}` });
      }
      resetCompose();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setComposeSending(false);
    }
  };

  const resetCompose = () => {
    setComposeTarget([]); setComposeMessage(""); setComposeScheduledAt(""); setComposeIndividualPhone(""); setComposeIndividualName(""); setSendMode("channels");
  };

  const handleDeleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast({ title: "Mensagem removida" });
  };

  const handleMarkSent = async (id: string) => {
    await supabase.from("messages").update({ status: "sent", sent_at: new Date().toISOString() } as any).eq("id", id);
    toast({ title: "Marcada como enviada" });
  };

  const getTypeIcon = (type: string) => channelTypes.find(ct => ct.id === type)?.icon || Users;
  const getTypeLabel = (type: string) => channelTypes.find(ct => ct.id === type)?.label || "Grupo";

  const filteredMessages = messages.filter(m => {
    if (historyFilter !== "all" && m.status !== historyFilter) return false;
    if (historySearch && !m.content.toLowerCase().includes(historySearch.toLowerCase())) return false;
    return true;
  });

  const groupedByPlatform = messagingPlatformConfigs
    .filter(mp => mp.id !== "custom")
    .map(mp => ({
      ...mp,
      channels: channels.filter(c => c.platform === mp.id),
    }));

  // Custom platforms
  const knownIds = messagingPlatformConfigs.map(p => p.id);
  const customChannels = channels.filter(c => !knownIds.includes(c.platform));
  const customPlatforms = [...new Set(customChannels.map(c => c.platform))];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Mensagens & Canais</h1>
        <p className="text-muted-foreground">Gerencie canais, compose e veja o histórico de mensagens</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="channels" className="rounded-lg data-[state=active]:bg-background gap-2">
            <Hash className="w-4 h-4" /> Canais
          </TabsTrigger>
          <TabsTrigger value="compose" className="rounded-lg data-[state=active]:bg-background gap-2">
            <Send className="w-4 h-4" /> Compor
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background gap-2">
            <MessageCircle className="w-4 h-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* ===== CHANNELS TAB ===== */}
        <TabsContent value="channels">
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar Canal
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl border border-border">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="font-medium text-lg">Nenhum canal configurado</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Adicione seus grupos, listas de transmissão e comunidades</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Canal</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByPlatform.filter(g => g.channels.length > 0).map(group => {
                const platform = socialPlatforms.find(p => p.id === group.id);
                const PlatformIcon = platform?.icon;
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-3 mb-4">
                      {PlatformIcon && (
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform?.color)}>
                          <PlatformIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <h2 className="font-display font-bold text-lg">{group.name}</h2>
                      <span className="text-sm text-muted-foreground">({group.channels.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.channels.map((ch, idx) => {
                        const TypeIcon = getTypeIcon(ch.channel_type);
                        return (
                          <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="glass-card rounded-2xl border border-border p-4 hover:border-primary/30 transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                  <TypeIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{ch.channel_name}</p>
                                  <p className="text-xs text-muted-foreground">{getTypeLabel(ch.channel_type)}</p>
                                </div>
                              </div>
                              <button onClick={() => handleDelete(ch.id)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              {ch.members_count > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.members_count} membros</span>}
                              {ch.channel_id && <span className="truncate max-w-[140px]">ID: {ch.channel_id}</span>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Custom platforms */}
              {customPlatforms.map(cpName => {
                const cChannels = customChannels.filter(c => c.platform === cpName);
                return (
                  <div key={cpName}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h2 className="font-display font-bold text-lg capitalize">{cpName}</h2>
                      <span className="text-sm text-muted-foreground">({cChannels.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cChannels.map((ch, idx) => {
                        const TypeIcon = getTypeIcon(ch.channel_type);
                        return (
                          <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="glass-card rounded-2xl border border-border p-4 hover:border-primary/30 transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><TypeIcon className="w-5 h-5 text-muted-foreground" /></div>
                                <div>
                                  <p className="font-medium text-sm">{ch.channel_name}</p>
                                  <p className="text-xs text-muted-foreground">{getTypeLabel(ch.channel_type)}</p>
                                </div>
                              </div>
                              <button onClick={() => handleDelete(ch.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== COMPOSE TAB ===== */}
        <TabsContent value="compose">
          <div className="glass-card rounded-2xl border border-border p-6 max-w-2xl">
            <h3 className="font-display font-bold text-lg mb-6">Compor Mensagem</h3>

            {/* Send mode toggle */}
            <div className="flex gap-2 mb-6">
              <Button variant={sendMode === "channels" ? "default" : "outline"} size="sm" onClick={() => setSendMode("channels")} className="gap-2">
                <Users className="w-4 h-4" /> Para Canais
              </Button>
              <Button variant={sendMode === "individual" ? "default" : "outline"} size="sm" onClick={() => setSendMode("individual")} className="gap-2">
                <Phone className="w-4 h-4" /> Individual
              </Button>
            </div>

            {sendMode === "channels" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecione os destinatários</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
                    {channels.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum canal. Adicione na aba Canais.</p>
                    ) : channels.map(ch => {
                      const platform = socialPlatforms.find(p => p.id === ch.platform);
                      const PIcon = platform?.icon;
                      const selected = composeTarget.includes(ch.id);
                      return (
                        <button key={ch.id} type="button" onClick={() => toggleComposeTarget(ch.id)}
                          className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                            selected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40")}>
                          {PIcon && <div className={cn("w-5 h-5 rounded flex items-center justify-center", platform?.color)}><PIcon className="w-3 h-3 text-white" /></div>}
                          {!PIcon && <div className="w-5 h-5 rounded bg-muted flex items-center justify-center"><Hash className="w-3 h-3" /></div>}
                          <span className="flex-1 text-left">{ch.channel_name}</span>
                          <span className="text-xs text-muted-foreground">{getTypeLabel(ch.channel_type)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Plataforma</label>
                  <Select value={composeIndividualPlatform} onValueChange={setComposeIndividualPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Número / Username</label>
                  <Input value={composeIndividualPhone} onChange={e => setComposeIndividualPhone(e.target.value)}
                    placeholder={composeIndividualPlatform === "whatsapp" ? "+55 11 99999-9999" : "@username"} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome (opcional)</label>
                  <Input value={composeIndividualName} onChange={e => setComposeIndividualName(e.target.value)} placeholder="Nome do contato" />
                </div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem</label>
                <Textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Agendar para (opcional)</label>
                <Input type="datetime-local" value={composeScheduledAt} onChange={e => setComposeScheduledAt(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} disabled={composeSending || !composeMessage.trim() || (sendMode === "channels" && composeTarget.length === 0) || (sendMode === "individual" && !composeIndividualPhone.trim())}
                  className="gap-2">
                  {composeSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {composeScheduledAt ? "Agendar" : "Salvar rascunho"}
                </Button>
                <Button variant="outline" onClick={resetCompose}>Limpar</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ===== HISTORY TAB ===== */}
        <TabsContent value="history">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Buscar mensagens..." className="pl-10" />
              </div>
              <div className="flex gap-1">
                {[{ id: "all", label: "Todas" }, { id: "draft", label: "Rascunhos" }, { id: "scheduled", label: "Agendadas" }, { id: "sent", label: "Enviadas" }, { id: "failed", label: "Falhas" }].map(f => (
                  <Button key={f.id} variant={historyFilter === f.id ? "default" : "outline"} size="sm" onClick={() => setHistoryFilter(f.id)}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl border border-border">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="font-medium">Nenhuma mensagem encontrada</p>
                <p className="text-sm text-muted-foreground mt-1">Compose uma mensagem na aba Compor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg, idx) => {
                  const ch = msg.channel_id ? channels.find(c => c.id === msg.channel_id) : null;
                  const platform = socialPlatforms.find(p => p.id === (msg.platform || ch?.platform));
                  const PIcon = platform?.icon;
                  const statusCfg = messageStatusConfig[msg.status] || messageStatusConfig.draft;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className="glass-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-all group">
                      <div className="flex items-start gap-3">
                        {/* Avatar / Platform */}
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", platform?.color || "bg-muted")}>
                          {PIcon ? <PIcon className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-muted-foreground" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {ch?.channel_name || msg.recipient_name || msg.recipient_phone || "Individual"}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px] gap-1", statusCfg.color)}>
                              <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                            </Badge>
                          </div>
                          {/* Chat bubble */}
                          <div className="bg-primary/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(msg.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                            {msg.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(msg.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {(msg.status === "draft" || msg.status === "scheduled") && (
                            <button onClick={() => handleMarkSent(msg.id)} className="p-1.5 rounded-lg hover:bg-green-500/10 hover:text-green-500 transition-all" title="Marcar como enviada">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Plataforma</label>
              <Select value={formPlatform} onValueChange={(v) => { setFormPlatform(v); setFormChannelType(messagingPlatformConfigs.find(p => p.id === v)?.types[0] || "group"); }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {messagingPlatformConfigs.map(mp => (
                    <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formPlatform === "custom" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Nome da rede</label>
                <Input value={formCustomPlatform} onChange={e => setFormCustomPlatform(e.target.value)} placeholder="Ex: Discord, Signal..." />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do canal/grupo</label>
              <Input value={formChannelName} onChange={e => setFormChannelName(e.target.value)} placeholder="Ex: Marketing Team" />
            </div>
            {availableTypes.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <Select value={formChannelType} onValueChange={setFormChannelType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableTypes.map(typeId => {
                      const ct = channelTypes.find(c => c.id === typeId);
                      return ct ? <SelectItem key={ct.id} value={ct.id}>{ct.label}</SelectItem> : null;
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">ID do canal (opcional)</label>
              <Input value={formChannelId} onChange={e => setFormChannelId(e.target.value)} placeholder="ID ou link do grupo" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nº de membros (opcional)</label>
              <Input type="number" value={formMembersCount} onChange={e => setFormMembersCount(e.target.value)} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddChannel} disabled={submitting || !formPlatform || !formChannelName.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
