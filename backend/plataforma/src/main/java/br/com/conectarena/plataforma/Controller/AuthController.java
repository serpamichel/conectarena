package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.AuthRequest;
import br.com.conectarena.plataforma.Model.Usuario;
import br.com.conectarena.plataforma.Repository.UsuarioRepository;
import br.com.conectarena.plataforma.Service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastro(@RequestBody AuthRequest request) {
        boolean emailExiste = usuarioRepository.findAll().stream()
                .anyMatch(u -> u.getEmail().equals(request.getEmail()));
        if (emailExiste) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Email já cadastrado"));
        }

        if (request.getSenha().length() < 8) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "Senha deve ter no mínimo 8 caracteres"));
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setRole("USER");

        usuarioRepository.save(usuario);

        String token = jwtService.gerarToken(usuario.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "nome", usuario.getNome()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(request.getEmail()))
                .findFirst();

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Email ou senha inválidos"));
        }

        Usuario usuario = usuarioOpt.get();

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Email ou senha inválidos"));
        }

        String token = jwtService.gerarToken(usuario.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "nome", usuario.getNome()));
    }

    @GetMapping("/usuario/{id}/anonimizado")
    public ResponseEntity<?> dadosAnonimizados(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Usuário não encontrado"));
        }

        Usuario usuario = usuarioOpt.get();

        return ResponseEntity.ok(Map.of(
                "id", usuario.getId(),
                "nome", anonimizarNome(usuario.getNome()),
                "email", anonimizarEmail(usuario.getEmail())
        ));
    }

    private String anonimizarEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] partes = email.split("@");
        String usuario = partes[0];
        String dominio = partes[1];
        String usuarioMask = usuario.substring(0, Math.min(2, usuario.length())) + "***";
        String dominioMask = dominio.substring(0, Math.min(1, dominio.length())) + "***";
        return usuarioMask + "@" + dominioMask;
    }

    private String anonimizarNome(String nome) {
        if (nome == null || nome.isBlank()) return "***";
        String[] partes = nome.split(" ");
        StringBuilder resultado = new StringBuilder();
        for (String parte : partes) {
            if (parte.length() <= 1) {
                resultado.append(parte).append(" ");
            } else {
                resultado.append(parte.charAt(0)).append("***").append(" ");
            }
        }
        return resultado.toString().trim();
    }
}
