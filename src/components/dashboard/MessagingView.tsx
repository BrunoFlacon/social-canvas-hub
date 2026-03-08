import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Plus, Trash2, Send, Users, Radio as BroadcastIcon, Hash, User, Loader2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialPlatforms } from "@/components/icons/SocialIcons";
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

const messagingPlatforms = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "telegram", name: "Telegram" },
  { id: "facebook", name: "Grupos Facebook" },
  { id: "instagram", name: "Canais Instagram" },
];

const channelTypes = [
  { id: "group", label: "Grupo", icon: Users },
  { id: "broadcast", label: "Lista de Transmissão", icon: BroadcastIcon },
  { id: "community", label: "Comunidade", icon: Hash },
  { id: "individual", label: "Individual", icon: User },
];

export const MessagingView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<MessagingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);

  // Add channel form
  const [formPlatform, setFormPlatform] = useState("");
  const [formChannelName, setFormChannelName] = useState("");
  const [formChannelId, setFormChannelId] = useState("");
  const [formChannelType, setFormChannelType] = useState("group");
  const [formMembersCount, setFormMembersCount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Compose message form
  const [composeTarget, setComposeTarget] = useState<string[]>([]);
  const [composeMessage, setComposeMessage] = useState("");

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

  useEffect(() => { fetchChannels(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messaging-channels-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "messaging_channels", filter: `user_id=eq.${user.id}` }, () => fetchChannels())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAddChannel = async () => {
    if (!user || !formPlatform || !formChannelName.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("messaging_channels").insert({
      user_id: user.id,
      platform: formPlatform,
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
    setFormPlatform(""); setFormChannelName(""); setFormChannelId(""); setFormChannelType("group"); setFormMembersCount("");
  };

  const toggleComposeTarget = (id: string) => {
    setComposeTarget(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSendMessage = () => {
    if (composeTarget.length === 0 || !composeMessage.trim()) return;
    const targetNames = channels.filter(c => composeTarget.includes(c.id)).map(c => c.channel_name).join(", ");
    toast({ title: "Mensagem agendada!", description: `Será enviada para: ${targetNames}` });
    setShowComposeDialog(false);
    setComposeTarget([]);
    setComposeMessage("");
  };

  const getTypeIcon = (type: string) => {
    const found = channelTypes.find(ct => ct.id === type);
    return found?.icon || Users;
  };

  const getTypeLabel = (type: string) => {
    const found = channelTypes.find(ct => ct.id === type);
    return found?.label || "Grupo";
  };

  const groupedByPlatform = messagingPlatforms.map(mp => ({
    ...mp,
    channels: channels.filter(c => c.platform === mp.id),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Mensagens & Canais</h1>
        <p className="text-muted-foreground">Gerencie grupos, canais de transmissão, comunidades e envios individuais</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Canal
        </Button>
        <Button variant="outline" onClick={() => setShowComposeDialog(true)} disabled={channels.length === 0} className="gap-2">
          <Send className="w-4 h-4" /> Compor Mensagem
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
                      <motion.div
                        key={ch.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card rounded-2xl border border-border p-4 hover:border-primary/30 transition-all group"
                      >
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
                          <button
                            onClick={() => handleDelete(ch.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {ch.members_count > 0 && (
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.members_count} membros</span>
                          )}
                          {ch.channel_id && (
                            <span className="truncate max-w-[140px]">ID: {ch.channel_id}</span>
                          )}
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

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Plataforma</label>
              <Select value={formPlatform} onValueChange={setFormPlatform}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {messagingPlatforms.map(mp => (
                    <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do canal/grupo</label>
              <Input value={formChannelName} onChange={e => setFormChannelName(e.target.value)} placeholder="Ex: Marketing Team" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select value={formChannelType} onValueChange={setFormChannelType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelTypes.map(ct => (
                    <SelectItem key={ct.id} value={ct.id}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Compor Mensagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Selecione os destinatários</label>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
                {channels.map(ch => {
                  const platform = socialPlatforms.find(p => p.id === ch.platform);
                  const PIcon = platform?.icon;
                  const selected = composeTarget.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleComposeTarget(ch.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                        selected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40"
                      )}
                    >
                      {PIcon && (
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center", platform?.color)}>
                          <PIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="flex-1 text-left">{ch.channel_name}</span>
                      <span className="text-xs text-muted-foreground">{getTypeLabel(ch.channel_type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mensagem</label>
              <Textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>Cancelar</Button>
            <Button onClick={handleSendMessage} disabled={composeTarget.length === 0 || !composeMessage.trim()} className="gap-2">
              <Send className="w-4 h-4" /> Enviar para {composeTarget.length} canal(is)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
