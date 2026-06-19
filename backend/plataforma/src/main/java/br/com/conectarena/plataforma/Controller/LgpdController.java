package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.Usuario;
import br.com.conectarena.plataforma.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/lgpd")
public class LgpdController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Endpoint público — qualquer pessoa pode ver a política de privacidade
    @GetMapping("/politica-privacidade")
    public ResponseEntity<?> politicaPrivacidade() {
        return ResponseEntity.ok(Map.of(
            "titulo", "Política de Privacidade — ConectArena",
            "versao", "1.0",
            "dataVigencia", "2025-01-01",
            "dadosColetados", "Nome, e-mail e dados de compra de ingressos",
            "finalidade", "Autenticação, emissão de ingressos e comunicação sobre eventos",
            "compartilhamento", "Os dados não são compartilhados com terceiros sem consentimento",
            "direitos", "Você pode acessar, corrigir, portabilizar ou solicitar a exclusão dos seus dados a qualquer momento",
            "contato", "privacidade@conectarena.com.br"
        ));
    }

    // Registra ou atualiza o consentimento do usuário autenticado
    @PostMapping("/consentir")
    public ResponseEntity<?> registrarConsentimento(Authentication authentication) {
        Optional<Usuario> usuarioOpt = buscarPorEmail(authentication.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Usuário não encontrado"));
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setConsentimentoLgpd(true);
        usuario.setDataConsentimento(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "mensagem", "Consentimento registrado com sucesso",
            "dataConsentimento", usuario.getDataConsentimento().toString()
        ));
    }

    // Exporta todos os dados pessoais do usuário autenticado (direito à portabilidade)
    @GetMapping("/meus-dados")
    public ResponseEntity<?> exportarMeusDados(Authentication authentication) {
        Optional<Usuario> usuarioOpt = buscarPorEmail(authentication.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Usuário não encontrado"));
        }

        Usuario usuario = usuarioOpt.get();
        return ResponseEntity.ok(Map.of(
            "id", usuario.getId(),
            "nome", usuario.getNome(),
            "email", usuario.getEmail(),
            "role", usuario.getRole(),
            "consentimentoLgpd", usuario.isConsentimentoLgpd(),
            "dataConsentimento", usuario.getDataConsentimento() != null ? usuario.getDataConsentimento().toString() : "não registrado",
            "contaAtiva", usuario.isAtivo(),
            "dataSolicitacaoExclusao", usuario.getDataSolicitacaoExclusao() != null ? usuario.getDataSolicitacaoExclusao().toString() : "nenhuma"
        ));
    }

    // Realiza o soft delete — marca a conta como inativa sem apagar os dados do banco
    @PostMapping("/solicitar-exclusao")
    public ResponseEntity<?> solicitarExclusao(Authentication authentication) {
        Optional<Usuario> usuarioOpt = buscarPorEmail(authentication.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Usuário não encontrado"));
        }

        Usuario usuario = usuarioOpt.get();

        if (!usuario.isAtivo()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Solicitação de exclusão já registrada anteriormente"));
        }

        usuario.setAtivo(false);
        usuario.setDataSolicitacaoExclusao(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "mensagem", "Solicitação de exclusão registrada. Sua conta foi desativada.",
            "dataSolicitacao", usuario.getDataSolicitacaoExclusao().toString()
        ));
    }

    private Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst();
    }
}
