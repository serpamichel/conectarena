import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Users, Plus, Check, Send, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Edit, Trash } from 'lucide-react';
import { communityGroups } from '../data/communityData';
import { addPostComment, fetchPosts, createPost, togglePostLike, getEditedPostsForUser, saveEditedPostForUser, getDeletedPostIdsForUser, markPostDeletedForUser, fetchPostComments, type ApiPost, type ApiComment } from '../services/api';
import containsProfanity from '../utils/profanity';
import { warnIfOffline } from '../utils/offline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'grupos'>('feed');
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<number, ApiComment[]>>({});
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState<number | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const newPostHasProfanity = containsProfanity(newPost);

  useEffect(() => {
    fetchPosts(user?.id)
      .then((fetched) => {
        const edits = user ? getEditedPostsForUser(user.id) : {};
        const deleted = user ? getDeletedPostIdsForUser(user.id) : [];
        const applied = fetched
          .filter((p) => !deleted.includes(String(p.id)))
          .map((p) => ({ ...p, ...(edits[String(p.id)] ?? {}) }));
        setPosts(applied);
      })
      .catch((e) => { console.error(e); setPosts([]); })
      .finally(() => setLoadingPosts(false));
  }, [user?.id]);

  const handleLike = async (postId: number) => {
    if (!user) return;
    if (warnIfOffline('curtir o post')) return;
    try {
      const result = await togglePostLike(postId, user.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: result.likes, likedByMe: result.likedByMe }
            : p
        )
      );
    } catch {
      // silently ignore like errors
    }
  };

  const openEditPost = (post: ApiPost) => {
    setEditingPostId(post.id);
    setEditDraft(post.content);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
      if (!user || editingPostId == null) return;
      if (containsProfanity(editDraft)) {
        window.alert('Seu post contém linguagem proibida. Remova palavras chulas para continuar.');
        return;
      }
      if (warnIfOffline('editar post')) return;
      saveEditedPostForUser(user.id, String(editingPostId), { content: editDraft });
      setPosts((prev) => prev.map((p) => (p.id === editingPostId ? { ...p, content: editDraft } : p)));
      setShowEditDialog(false);
      setEditingPostId(null);
      setEditDraft('');
    };

    const handleDeletePost = (postId: number) => {
      if (!user) return;
      if (warnIfOffline('excluir post')) return;
      if (!window.confirm('Tem certeza que deseja excluir este post?')) return;
      markPostDeletedForUser(user.id, String(postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    };
  const handleToggleComment = (postId: number) => {
    setCommentingPostId((prev) => {
      const next = prev === postId ? null : postId;
      if (next != null && !commentsByPost[postId]) {
        fetchPostComments(postId)
          .then((list) => setCommentsByPost((p) => ({ ...p, [postId]: list })))
          .catch(() => setCommentsByPost((p) => ({ ...p, [postId]: [] })));
      }
      return next;
    });
  };

  const handleCommentChange = (postId: number, text: string) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: text }));
  };

  const handleSendComment = async (postId: number) => {
    if (!user) return;
    const draft = commentDrafts[postId]?.trim();
    if (!draft) return;

    if (containsProfanity(draft)) {
      window.alert('Seu comentário contém linguagem proibida. Remova palavras chulas para continuar.');
      return;
    }

    if (warnIfOffline('comentar')) return;
    setCommentSubmitting(postId);
    try {
      const result = await addPostComment({
        postId,
        userId: user.id,
        authorName: user.name,
        text: draft,
      });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: result.comments } : p)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      // refresh comments list
      try {
        const list = await fetchPostComments(postId);
        setCommentsByPost((p) => ({ ...p, [postId]: list }));
      } catch {
        // ignore
      }
    } catch {
      // silently ignore comment errors
    } finally {
      setCommentSubmitting(null);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;
    if (containsProfanity(newPost)) {
      window.alert('Seu post contém linguagem proibida. Remova palavras chulas para continuar.');
      return;
    }
    setPublishing(true);
    if (warnIfOffline('publicar')) { setPublishing(false); return; }
    try {
      const created = await createPost({
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        content: newPost.trim(),
      });
      setPosts((prev) => [created, ...prev]);
      setNewPost('');
      setShowNewPost(false);
    } catch {
      // silently ignore
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Tabs */}
      <div className="bg-white sticky top-14 z-40 border-b">
        <div className="grid grid-cols-2">
          {(['feed', 'grupos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-base font-semibold transition-colors relative ${
                activeTab === tab ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              {tab === 'feed' ? 'Feed' : 'Grupos'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="pb-4">
          {/* Create Post */}
          <div className="bg-white p-4 mb-2">
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-full active:bg-slate-100 transition-colors"
            >
              <img
                src={user?.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id ?? 'default'}`}
                alt="Seu avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-slate-500 text-base">
                Compartilhe algo com a comunidade...
              </span>
            </button>

            {showNewPost && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="O que você quer compartilhar?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] text-base resize-none"
                  autoFocus
                />
                {newPostHasProfanity && (
                  <p className="text-sm text-rose-600">
                    Seu post contém linguagem proibida. Remova palavras chulas para continuar.
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => { setShowNewPost(false); setNewPost(''); }}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || publishing || newPostHasProfanity}
                    className="bg-[#305BF2] hover:bg-[#2347c9] h-11 px-6"
                  >
                    {publishing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Publicar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Loading */}
          {loadingPosts && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-32 animate-pulse" />
              ))}
            </div>
          )}

          {/* Posts List */}
          {!loadingPosts && (
            <div className="space-y-2">
              {posts.map((post) => (
                <Card key={post.id} className="rounded-none border-x-0">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base truncate">{post.authorName}</h3>
                          {post.authorVerified && (
                            <Check className="w-4 h-4 text-blue-600 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-base leading-relaxed mb-3">{post.content}</p>

                    {/* Image */}
                    {post.imageUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden -mx-4">
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-full h-[280px] object-cover"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          post.likedByMe
                            ? 'text-[#305BF2] bg-blue-50'
                            : 'text-slate-600 active:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${post.likedByMe ? 'fill-current' : ''}`} />
                        <span className="font-semibold">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComment(post.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="font-semibold">{post.comments}</span>
                      </button>

                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors">
                        <Share2 className="w-6 h-6" />
                      </button>

                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors">
                        <Bookmark className="w-6 h-6" />
                      </button>
                      {post.authorId === user?.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditPost(post)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 active:bg-red-50 transition-colors"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {commentingPostId === post.id && (
                                      <div className="mt-3 space-y-2">
                                        {/* Comments List */}
                                        <div className="space-y-2">
                                          {(commentsByPost[post.id] ?? []).map((c) => (
                                            <div key={c.id} className="bg-slate-50 p-3 rounded">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">{c.authorName}</span>
                                                <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                                              </div>
                                              <div className="text-sm text-slate-700">{c.content}</div>
                                            </div>
                                          ))}
                                        </div>
                        <Textarea
                          placeholder="Escreva seu comentário..."
                          value={commentDrafts[post.id] ?? ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          className="min-h-[70px] text-sm resize-none"
                        />
                        {containsProfanity(commentDrafts[post.id] ?? '') && (
                          <p className="text-sm text-rose-600">
                            Seu comentário contém linguagem proibida. Remova palavras chulas para continuar.
                          </p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleToggleComment(post.id)}
                            className="h-10"
                          >
                            Fechar
                          </Button>
                          <Button
                            onClick={() => handleSendComment(post.id)}
                            disabled={
                              !commentDrafts[post.id]?.trim() ||
                              commentSubmitting === post.id ||
                              containsProfanity(commentDrafts[post.id] ?? '')
                            }
                            className="bg-[#305BF2] hover:bg-[#2347c9] h-10 px-5"
                          >
                            {commentSubmitting === post.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Comentar'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups Tab */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} className="bg-[#305BF2] hover:bg-[#2347c9]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {activeTab === 'grupos' && (
        <div className="p-4 space-y-4">
          {communityGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden shadow-md">
              <div className="relative h-[160px]">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-2">{group.name}</h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{group.members.toLocaleString('pt-BR')} membros</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-base text-slate-600 mb-4 leading-relaxed">{group.description}</p>
                <Button
                  onClick={() => handleJoinGroup(group.id)}
                  className={`w-full h-12 text-base font-semibold ${
                    joinedGroups.has(group.id)
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {joinedGroups.has(group.id) ? (
                    <><Check className="w-5 h-5 mr-2" />Participando</>
                  ) : (
                    <><Plus className="w-5 h-5 mr-2" />Participar</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-2 border-blue-300 bg-blue-50 shadow-none">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Criar Novo Grupo</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Reúna pessoas com interesses em comum e compartilhe experiências
              </p>
              <Button className="bg-[#305BF2] hover:bg-[#2347c9] h-12 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Criar Grupo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAB */}
      {activeTab === 'feed' && !showNewPost && (
        <button
          onClick={() => setShowNewPost(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#305BF2] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
