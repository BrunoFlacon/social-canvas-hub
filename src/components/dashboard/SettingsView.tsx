import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Bell, Key, Shield, Globe, Save, Camera, Check, AlertCircle, Loader2, Unplug, Info,
  Eye, EyeOff, ChevronDown, ChevronUp, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSocialConnections } from "@/hooks/useSocialConnections";
import { useApiCredentials, PLATFORM_CREDENTIAL_FIELDS } from "@/hooks/useApiCredentials";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const platformConfigs = [
  { platform: 'facebook', name: 'Facebook', icon: '📘', oauthSupported: true },
  { platform: 'instagram', name: 'Instagram', icon: '📸', oauthSupported: true },
  { platform: 'twitter', name: 'X (Twitter)', icon: '🐦', oauthSupported: true },
  { platform: 'linkedin', name: 'LinkedIn', icon: '💼', oauthSupported: true },
  { platform: 'youtube', name: 'YouTube', icon: '▶️', oauthSupported: true },
  { platform: 'tiktok', name: 'TikTok', icon: '🎵', oauthSupported: true },
  { platform: 'whatsapp', name: 'WhatsApp Business', icon: '💬', oauthSupported: true },
  { platform: 'telegram', name: 'Telegram', icon: '✈️', oauthSupported: false },
  { platform: 'pinterest', name: 'Pinterest', icon: '📌', oauthSupported: true },
  { platform: 'snapchat', name: 'Snapchat', icon: '👻', oauthSupported: true },
  { platform: 'threads', name: 'Threads', icon: '🧵', oauthSupported: true },
  { platform: 'google', name: 'Google API', icon: '🔍', oauthSupported: true },
  { platform: 'site', name: 'Website', icon: '🌐', oauthSupported: false },
];

export const SettingsView = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const { connections, loading: connectionsLoading, initiateOAuth, disconnect } = useSocialConnections();
  const { credentials, loading: credsLoading, saving, saveCredentials, deleteCredentials, hasCredentials } = useApiCredentials();
  
  const [profileData, setProfileData] = useState({
    name: profile?.name || user?.email?.split('@')[0] || "",
    email: user?.email || "",
    bio: profile?.bio || "",
    website: ""
  });

  const [notifications, setNotifications] = useState({
    emailPosts: true, emailEngagement: false, pushPosts: true, pushEngagement: true, pushSchedule: true, weeklyReport: true
  });

  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Formato inválido", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const success = await updateProfile({ avatar_url: avatarUrl });
      if (success) toast({ title: "Foto atualizada" });
    } catch (error) {
      toast({ title: "Erro no upload", description: "Não foi possível enviar a foto.", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile({ name: profileData.name, bio: profileData.bio });
    if (success) toast({ title: "Perfil atualizado" });
    else toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
  };

  const handleConnectApi = async (platform: string) => {
    const existing = connections.find(c => c.platform === platform && c.is_connected);
    if (existing) {
      await disconnect(platform);
      return;
    }
    setConnectingPlatform(platform);
    await initiateOAuth(platform);
    setConnectingPlatform(null);
  };

  const toggleExpand = (platform: string) => {
    if (expandedPlatform === platform) {
      setExpandedPlatform(null);
    } else {
      setExpandedPlatform(platform);
      // Initialize form with saved values
      if (!formValues[platform]) {
        setFormValues(prev => ({
          ...prev,
          [platform]: credentials[platform] || {}
        }));
      }
    }
  };

  const updateFormField = (platform: string, key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [platform]: { ...(prev[platform] || {}), [key]: value }
    }));
  };

  const handleSaveCreds = async (platform: string) => {
    const vals = formValues[platform] || {};
    const success = await saveCredentials(platform, vals);
    if (success) {
      setFormValues(prev => ({ ...prev, [platform]: vals }));
    }
  };

  const handleDeleteCreds = async (platform: string) => {
    const success = await deleteCredentials(platform);
    if (success) {
      setFormValues(prev => {
        const next = { ...prev };
        delete next[platform];
        return next;
      });
    }
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const maskValue = (value: string) => {
    if (!value || value.length <= 6) return "••••••";
    return value.slice(0, 3) + "••••••" + value.slice(-3);
  };

  return (
    <div>
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-3xl mb-2">Configurações</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground">Gerencie suas preferências e integrações</motion.p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background"><User className="w-4 h-4 mr-2" />Perfil</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-background"><Key className="w-4 h-4 mr-2" />APIs</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background"><Shield className="w-4 h-4 mr-2" />Segurança</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border p-6">
            <h3 className="font-display font-bold text-lg mb-6">Informações do Perfil</h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 rounded-2xl">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profileData.name} className="rounded-2xl object-cover" />}
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-3xl font-bold">{profileData.name.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{profileData.name || "Usuário"}</h4>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={profileData.email} disabled className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full h-24 px-3 py-2 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Conte um pouco sobre você..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} className="pl-10 bg-muted/50" placeholder="https://seusite.com" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-accent"><Save className="w-4 h-4 mr-2" />Salvar alterações</Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border p-6">
            <h3 className="font-display font-bold text-lg mb-6">Preferências de Notificação</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Notificações por Email</h4>
                <div className="space-y-4">
                  {[
                    { key: 'emailPosts', title: 'Posts publicados', desc: 'Receba confirmação quando posts forem publicados' },
                    { key: 'emailEngagement', title: 'Engajamento', desc: 'Alertas de likes, comentários e compartilhamentos' },
                    { key: 'weeklyReport', title: 'Relatório semanal', desc: 'Resumo de performance das suas redes' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">Notificações Push</h4>
                <div className="space-y-4">
                  {[
                    { key: 'pushPosts', title: 'Posts publicados', desc: 'Notificação instantânea de publicações' },
                    { key: 'pushEngagement', title: 'Engajamento em tempo real', desc: 'Alertas instantâneos de interações' },
                    { key: 'pushSchedule', title: 'Lembretes de agendamento', desc: 'Aviso antes de posts agendados' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* API Tab — Expandable CRUD cards */}
        <TabsContent value="api">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg">Integrações de API</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure credenciais e conecte suas contas</p>
              </div>
              {(connectionsLoading || credsLoading) && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
            
            <div className="space-y-3">
              {platformConfigs.map((config) => {
                const conn = connections.find(c => c.platform === config.platform && c.is_connected);
                const isConnecting = connectingPlatform === config.platform;
                const isExpanded = expandedPlatform === config.platform;
                const hasCreds = hasCredentials(config.platform);
                const fields = PLATFORM_CREDENTIAL_FIELDS[config.platform] || [];
                const isSaving = saving === config.platform;
                const currentValues = formValues[config.platform] || credentials[config.platform] || {};
                
                return (
                  <div key={config.platform} className="rounded-xl border border-border overflow-hidden transition-all">
                    {/* Header row */}
                    <button
                      onClick={() => toggleExpand(config.platform)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                          conn ? "bg-green-500/10" : hasCreds ? "bg-yellow-500/10" : "bg-muted"
                        )}>
                          {config.icon}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{config.name}</p>
                            {conn && (
                              <Badge variant="default" className="text-[10px] bg-green-600 hover:bg-green-600">Conectado</Badge>
                            )}
                            {hasCreds && !conn && (
                              <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-600/30">Credenciais salvas</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {conn ? `Conectado${conn.page_name ? ` • ${conn.page_name}` : ''}` : 
                             hasCreds ? "Credenciais configuradas — pronto para conectar" : 
                             "Clique para configurar credenciais"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-border bg-background/50 space-y-4">
                            {/* Credential fields */}
                            {fields.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">Credenciais da API</p>
                                {fields.map((field) => {
                                  const fieldId = `${config.platform}-${field.key}`;
                                  const isVisible = visibleFields[fieldId] || false;
                                  const savedValue = credentials[config.platform]?.[field.key];
                                  const formValue = currentValues[field.key] || "";
                                  
                                  return (
                                    <div key={field.key} className="space-y-1">
                                      <label className="text-sm font-medium">{field.label}</label>
                                      <div className="relative">
                                        <Input
                                          type={field.masked && !isVisible ? "password" : "text"}
                                          value={formValue}
                                          onChange={(e) => updateFormField(config.platform, field.key, e.target.value)}
                                          placeholder={savedValue ? maskValue(savedValue) : `Insira ${field.label}`}
                                          className="bg-muted/50 pr-10"
                                        />
                                        {field.masked && (
                                          <button
                                            type="button"
                                            onClick={() => toggleFieldVisibility(fieldId)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                          >
                                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveCreds(config.platform)}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-primary to-accent"
                              >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                {hasCreds ? "Atualizar" : "Salvar Credenciais"}
                              </Button>

                              {hasCreds && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteCreds(config.platform)}
                                  disabled={isSaving}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remover
                                </Button>
                              )}

                              {config.oauthSupported && hasCreds && (
                                <Button
                                  size="sm"
                                  variant={conn ? "outline" : "secondary"}
                                  onClick={() => handleConnectApi(config.platform)}
                                  disabled={isConnecting}
                                >
                                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                   conn ? <><Unplug className="w-4 h-4 mr-1" />Desconectar</> : 
                                   <><Check className="w-4 h-4 mr-1" />Conectar</>}
                                </Button>
                              )}

                              {conn && (
                                <Button variant="ghost" size="sm" onClick={() => disconnect(config.platform)}>
                                  <Unplug className="w-4 h-4 mr-1" /> Desconectar
                                </Button>
                              )}
                            </div>

                            {/* Info note */}
                            {config.platform === 'telegram' && (
                              <p className="text-xs text-muted-foreground">
                                Telegram usa Bot Token em vez de OAuth. Crie um bot via @BotFather e cole o token aqui.
                              </p>
                            )}
                            {(config.platform === 'instagram' || config.platform === 'threads' || config.platform === 'whatsapp') && (
                              <p className="text-xs text-muted-foreground">
                                Usa as mesmas credenciais do Meta (Facebook) App. Configure o App ID e Secret do seu Meta App.
                              </p>
                            )}
                            {(config.platform === 'youtube') && (
                              <p className="text-xs text-muted-foreground">
                                Usa credenciais do Google Cloud Console. Habilite a YouTube Data API v3 no seu projeto.
                              </p>
                            )}
                            {config.platform === 'site' && (
                              <p className="text-xs text-muted-foreground">
                                Informe a URL do seu site para integração direta (RSS, embed, etc).
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-dashed border-border flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Insira as credenciais de cada plataforma e clique em "Salvar". Após salvar, o botão "Conectar" ficará disponível para iniciar a autenticação OAuth.
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border p-6">
            <h3 className="font-display font-bold text-lg mb-6">Segurança</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <h4 className="font-medium mb-1">Autenticação</h4>
                <p className="text-sm text-muted-foreground">Gerenciada pelo sistema de autenticação do projeto.</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <h4 className="font-medium mb-1">Sessões ativas</h4>
                <p className="text-sm text-muted-foreground">Você está logado neste dispositivo.</p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
