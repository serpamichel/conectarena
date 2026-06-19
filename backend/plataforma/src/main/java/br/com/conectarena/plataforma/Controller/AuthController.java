package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.AuthRequest;
import br.com.conectarena.plataforma.Model.Usuario;
import br.com.conectarena.plataforma.Repository.UsuarioRepository;
import br.com.conectarena.plataforma.Service.JwtService;
import br.com.conectarena.plataforma.Service.LoginAttemptService;
import jakarta.validation.Valid;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @Autowired
    private LoginAttemptService loginAttemptService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastro(@Valid @RequestBody AuthRequest request) {
        if (!request.isAceitouLgpd()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "É necessário aceitar a Política de Privacidade para se cadastrar"));
        }

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
        usuario.setConsentimentoLgpd(true);
        usuario.setDataConsentimento(LocalDateTime.now());

        usuarioRepository.save(usuario);

        String token = jwtService.gerarToken(usuario.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "nome", usuario.getNome(), "role", usuario.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        String email = request.getEmail();

        if (loginAttemptService.estaBloqueado(email)) {
            LocalDateTime bloqueadoAte = loginAttemptService.getBloqueadoAte(email);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                        "erro", "Conta bloqueada temporariamente por excesso de tentativas.",
                        "bloqueadoAte", bloqueadoAte.toString(),
                        "mensagem", "Tente novamente após " + bloqueadoAte.getHour() + "h" + String.format("%02d", bloqueadoAte.getMinute())
                    ));
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst();

        if (usuarioOpt.isEmpty()) {
            loginAttemptService.registrarFalha(email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "erro", "Email ou senha inválidos",
                        "tentativasRestantes", loginAttemptService.getTentativasRestantes(email)
                    ));
        }

        Usuario usuario = usuarioOpt.get();

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            loginAttemptService.registrarFalha(email);
            int restantes = loginAttemptService.getTentativasRestantes(email);
            if (restantes <= 0) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("erro", "Conta bloqueada por 15 minutos após múltiplas tentativas incorretas."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "erro", "Email ou senha inválidos",
                        "tentativasRestantes", restantes
                    ));
        }

        loginAttemptService.registrarSucesso(email);
        String token = jwtService.gerarToken(usuario.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "nome", usuario.getNome(), "role", usuario.getRole()));
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

    @org.springframework.web.bind.annotation.ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", mensagem));
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
