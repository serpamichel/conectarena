import { useState } from 'react';
import { Heart, MessageCircle, Share2, Users, Plus, Check, Send, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { communityPosts, communityGroups, type Post } from '../data/communityData';

export default function Community() {
  const [activeTab, setActiveTab] = useState<'feed' | 'grupos'>('feed');
  const [posts, setPosts] = useState<Post[]>(communityPosts);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [showNewPost, setShowNewPost] = useState(false);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: {
          name: 'Você',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
          verified: false,
        },
        content: newPost,
        likes: 0,
        comments: 0,
        timestamp: 'Agora',
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setShowNewPost(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Tabs */}
      <div className="bg-white sticky top-14 z-40 border-b">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-4 text-base font-semibold transition-colors relative ${
              activeTab === 'feed' 
                ? 'text-blue-600' 
                : 'text-slate-500'
            }`}
          >
            Feed
            {activeTab === 'feed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('grupos')}
            className={`py-4 text-base font-semibold transition-colors relative ${
              activeTab === 'grupos' 
                ? 'text-blue-600' 
                : 'text-slate-500'
            }`}
          >
            Grupos
            {activeTab === 'grupos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="pb-4">
          {/* Create Post Button */}
          <div className="bg-white p-4 mb-2">
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-full active:bg-slate-100 transition-colors"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
                alt="Seu avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-slate-500 text-base">
                Compartilhe algo com a comunidade...
              </span>
            </button>

            {/* New Post Form */}
            {showNewPost && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="O que você quer compartilhar?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] text-base resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewPost(false);
                      setNewPost('');
                    }}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="bg-[#305BF2] hover:bg-[#2347c9] h-11 px-6"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publicar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="space-y-2">
            {posts.map((post) => (
              <Card key={post.id} className="rounded-none border-x-0">
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base truncate">
                          {post.author.name}
                        </h3>
                        {post.author.verified && (
                          <Check className="w-4 h-4 text-blue-600 fill-current flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{post.timestamp}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-base leading-relaxed mb-3">{post.content}</p>

                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-3 rounded-xl overflow-hidden -mx-4">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-[280px] object-cover"
                      />
                    </div>
                  )}

                  {/* Post Tags */}
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

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-[#305BF2] bg-blue-50'
                          : 'text-slate-600 active:bg-slate-100'
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          likedPosts.has(post.id) ? 'fill-current' : ''
                        }`}
                      />
                      <span className="font-semibold">{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-semibold">{post.comments}</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors">
                      <Share2 className="w-6 h-6" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors">
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'grupos' && (
        <div className="p-4 space-y-4">
          {communityGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden shadow-md">
              <div className="relative h-[160px]">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{group.members.toLocaleString('pt-BR')} membros</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-base text-slate-600 mb-4 leading-relaxed">
                  {group.description}
                </p>
                <Button
                  onClick={() => handleJoinGroup(group.id)}
                  className={`w-full h-12 text-base font-semibold ${
                    joinedGroups.has(group.id)
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {joinedGroups.has(group.id) ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Participando
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Participar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Create Group CTA */}
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

      {/* Floating Action Button */}
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