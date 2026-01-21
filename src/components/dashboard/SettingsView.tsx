import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Key, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Camera,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApiToken {
  id: string;
  name: string;
  platform: string;
  isConnected: boolean;
  lastUsed?: string;
}

export const SettingsView = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    website: ""
  });

  const [notifications, setNotifications] = useState({
    emailPosts: true,
    emailEngagement: false,
    pushPosts: true,
    pushEngagement: true,
    pushSchedule: true,
    weeklyReport: true
  });

  const [apiTokens, setApiTokens] = useState<ApiToken[]>([
    { id: '1', name: 'Meta Business Suite', platform: 'meta', isConnected: false },
    { id: '2', name: 'Google API', platform: 'google', isConnected: false },
    { id: '3', name: 'YouTube Data API', platform: 'youtube', isConnected: false },
    { id: '4', name: 'TikTok for Developers', platform: 'tiktok', isConnected: false },
    { id: '5', name: 'X (Twitter) API', platform: 'twitter', isConnected: false },
  ]);

  const handleSaveProfile = () => {
    updateProfile({ name: profileData.name });
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const handleConnectApi = (tokenId: string) => {
    setApiTokens(prev => 
      prev.map(t => t.id === tokenId ? { ...t, isConnected: !t.isConnected } : t)
    );
    toast({
      title: "API configurada",
      description: "A conexão com a API foi atualizada."
    });
  };

  return (
    <div>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-3xl mb-2"
        >
          Configurações
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Gerencie suas preferências e integrações
        </motion.p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-background">
            <Key className="w-4 h-4 mr-2" />
            APIs
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-6">Informações do Perfil</h3>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-bold">
                  {profileData.name.charAt(0) || "U"}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{profileData.name || "Usuário"}</h4>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'hoje'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-muted/50"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full h-24 px-3 py-2 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="pl-10 bg-muted/50"
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-accent">
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-6">Preferências de Notificação</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Notificações por Email</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Posts publicados</p>
                      <p className="text-sm text-muted-foreground">Receba confirmação quando posts forem publicados</p>
                    </div>
                    <Switch
                      checked={notifications.emailPosts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailPosts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Engajamento</p>
                      <p className="text-sm text-muted-foreground">Alertas de likes, comentários e compartilhamentos</p>
                    </div>
                    <Switch
                      checked={notifications.emailEngagement}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailEngagement: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Relatório semanal</p>
                      <p className="text-sm text-muted-foreground">Resumo de performance das suas redes</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">Notificações Push</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Posts publicados</p>
                      <p className="text-sm text-muted-foreground">Notificação instantânea de publicações</p>
                    </div>
                    <Switch
                      checked={notifications.pushPosts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushPosts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Engajamento em tempo real</p>
                      <p className="text-sm text-muted-foreground">Alertas instantâneos de interações</p>
                    </div>
                    <Switch
                      checked={notifications.pushEngagement}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushEngagement: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembretes de agendamento</p>
                      <p className="text-sm text-muted-foreground">Aviso antes de posts agendados</p>
                    </div>
                    <Switch
                      checked={notifications.pushSchedule}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushSchedule: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg">Integrações de API</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Conecte suas contas para publicação automática
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Requer backend
              </div>
            </div>
            
            <div className="space-y-4">
              {apiTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      token.isConnected ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {token.isConnected ? "Conectado" : "Não conectado"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={token.isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleConnectApi(token.id)}
                    className={token.isConnected ? "" : "bg-gradient-to-r from-primary to-accent"}
                  >
                    {token.isConnected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Conectado
                      </>
                    ) : (
                      "Conectar"
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground text-center">
                Para conexões reais com APIs, é necessário habilitar o backend do Lovable Cloud.
                As integrações simuladas acima são apenas para demonstração.
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-display font-bold text-lg mb-6">Segurança da Conta</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Alterar senha</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mantenha sua conta segura alterando sua senha periodicamente
                    </p>
                    <div className="grid gap-3">
                      <Input type="password" placeholder="Senha atual" className="bg-muted/50" />
                      <Input type="password" placeholder="Nova senha" className="bg-muted/50" />
                      <Input type="password" placeholder="Confirmar nova senha" className="bg-muted/50" />
                    </div>
                    <Button className="mt-4" variant="outline">
                      Atualizar senha
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Autenticação de dois fatores</h4>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-destructive">Excluir conta</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                    </p>
                    <Button variant="destructive" size="sm">
                      Excluir minha conta
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
