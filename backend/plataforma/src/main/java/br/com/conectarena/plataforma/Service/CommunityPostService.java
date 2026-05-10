package br.com.conectarena.plataforma.Service;

import br.com.conectarena.plataforma.Model.Comment;
import br.com.conectarena.plataforma.Model.CommunityPost;
import br.com.conectarena.plataforma.Model.PostLike;
import br.com.conectarena.plataforma.Repository.CommentRepository;
import br.com.conectarena.plataforma.Repository.CommunityPostRepository;
import br.com.conectarena.plataforma.Repository.PostLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommunityPostService {

    @Autowired
    private CommunityPostRepository postRepository;

    @Autowired
    private PostLikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    public List<CommunityPost> getAllPosts(String userId) {
        List<CommunityPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        if (userId != null && !userId.isBlank()) {
            for (CommunityPost post : posts) {
                post.setLikedByMe(likeRepository.existsByPostIdAndUserId(post.getId(), userId));
            }
        }
        return posts;
    }

    public CommunityPost createPost(String authorId, String authorName, String authorAvatar,
                                    String content, List<String> tags) {
        CommunityPost post = new CommunityPost();
        post.setAuthorId(authorId);
        post.setAuthorName(authorName);
        post.setAuthorAvatar(authorAvatar);
        post.setAuthorVerified(false);
        post.setContent(content);
        post.setTags(tags != null ? tags : List.of());
        post.setLikes(0);
        post.setComments(0);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public int addComment(Long postId, String authorId, String authorName, String content) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post não encontrado"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setAuthorId(authorId);
        comment.setAuthorName(authorName);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        commentRepository.save(comment);

        post.setComments(post.getComments() + 1);
        postRepository.save(post);
        return post.getComments();
    }

    public CommunityPost toggleLike(Long postId, String userId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post não encontrado"));

        Optional<PostLike> existing = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            post.setLikes(Math.max(0, post.getLikes() - 1));
            post.setLikedByMe(false);
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            likeRepository.save(like);
            post.setLikes(post.getLikes() + 1);
            post.setLikedByMe(true);
        }
        return postRepository.save(post);
    }
}
