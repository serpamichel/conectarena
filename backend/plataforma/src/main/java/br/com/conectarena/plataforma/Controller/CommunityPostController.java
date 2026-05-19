package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.CommunityPost;
import br.com.conectarena.plataforma.Service.CommunityPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityPostController {

    @Autowired
    private CommunityPostService postService;

    @GetMapping
    public ResponseEntity<List<CommunityPost>> getAllPosts(
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(postService.getAllPosts(userId));
    }

    @PostMapping
    public ResponseEntity<CommunityPost> createPost(@RequestBody Map<String, Object> body) {
        String authorId = body.getOrDefault("authorId", "anonimo").toString();
        String authorName = body.getOrDefault("authorName", "Usuário").toString();
        String authorAvatar = body.getOrDefault("authorAvatar",
                "https://api.dicebear.com/7.x/avataaars/svg?seed=default").toString();
        String content = body.get("content").toString();

        @SuppressWarnings("unchecked")
        List<String> tags = body.containsKey("tags") ? (List<String>) body.get("tags") : List.of();

        CommunityPost post = postService.createPost(authorId, authorName, authorAvatar, content, tags);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String userId = body.getOrDefault("userId", "anonimo");
            CommunityPost post = postService.toggleLike(id, userId);
            return ResponseEntity.ok(Map.of("likes", post.getLikes(), "likedByMe", post.getLikedByMe()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String userId = body.getOrDefault("userId", "anonimo");
            String authorName = body.getOrDefault("authorName", "Usuário");
            String content = body.getOrDefault("text", "").trim();
            if (content.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Comentário vazio"));
            }
            int comments = postService.addComment(id, userId, authorName, content);
            return ResponseEntity.ok(Map.of("comments", comments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        List<Comment> comments = postService.getCommentsForPost(id);
        return ResponseEntity.ok(comments);
    }
}
