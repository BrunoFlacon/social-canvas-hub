import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  media_ids: string[];
  platforms: string[];
  media_type: string;
  orientation: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  content: string;
  media_ids?: string[];
  platforms: string[];
  media_type: string;
  orientation?: string;
  scheduled_at?: Date;
}

export function useScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the status to the correct type
      const typedPosts = (data || []).map((post) => ({
        ...post,
        status: post.status as ScheduledPost['status'],
      }));
      
      setPosts(typedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const createPost = async (input: CreatePostInput): Promise<ScheduledPost | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      return null;
    }

    // Validate content
    if (!input.content.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Digite o texto do seu post.",
        variant: "destructive",
      });
      return null;
    }

    if (input.content.length > 5000) {
      toast({
        title: "Conteúdo muito longo",
        description: "O texto deve ter no máximo 5000 caracteres.",
        variant: "destructive",
      });
      return null;
    }

    if (input.platforms.length === 0) {
      toast({
        title: "Selecione plataformas",
        description: "Escolha pelo menos uma rede social.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const status = input.scheduled_at ? 'scheduled' : 'draft';
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content: input.content.trim(),
          media_ids: input.media_ids || [],
          platforms: input.platforms,
          media_type: input.media_type,
          orientation: input.orientation || 'horizontal',
          status,
          scheduled_at: input.scheduled_at?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedPost: ScheduledPost = {
        ...data,
        status: data.status as ScheduledPost['status'],
      };

      setPosts((prev) => [typedPost, ...prev]);

      toast({
        title: status === 'scheduled' ? "Post agendado!" : "Rascunho salvo!",
        description: status === 'scheduled' 
          ? "Seu post será publicado no horário programado."
          : "Seu rascunho foi salvo.",
      });

      return typedPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro ao criar post",
        description: "Não foi possível salvar o post. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePost = async (postId: string, updates: Partial<CreatePostInput>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.content !== undefined) {
        if (updates.content.length > 5000) {
          toast({
            title: "Conteúdo muito longo",
            description: "O texto deve ter no máximo 5000 caracteres.",
            variant: "destructive",
          });
          return false;
        }
        updateData.content = updates.content.trim();
      }
      if (updates.media_ids !== undefined) updateData.media_ids = updates.media_ids;
      if (updates.platforms !== undefined) updateData.platforms = updates.platforms;
      if (updates.media_type !== undefined) updateData.media_type = updates.media_type;
      if (updates.orientation !== undefined) updateData.orientation = updates.orientation;
      if (updates.scheduled_at !== undefined) {
        updateData.scheduled_at = updates.scheduled_at?.toISOString() || null;
        updateData.status = updates.scheduled_at ? 'scheduled' : 'draft';
      }

      const { error } = await supabase
        .from('scheduled_posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPosts();

      toast({
        title: "Post atualizado",
        description: "As alterações foram salvas.",
      });

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));

      toast({
        title: "Post excluído",
        description: "O post foi removido.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getPostsByDate = (date: Date): ScheduledPost[] => {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter((post) => {
      if (!post.scheduled_at) return false;
      return post.scheduled_at.startsWith(dateStr);
    });
  };

  const getUpcomingPosts = (limit = 10): ScheduledPost[] => {
    const now = new Date().toISOString();
    return posts
      .filter((post) => post.status === 'scheduled' && post.scheduled_at && post.scheduled_at > now)
      .sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''))
      .slice(0, limit);
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    getPostsByDate,
    getUpcomingPosts,
    refetch: fetchPosts,
  };
}
