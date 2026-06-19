package br.com.conectarena.plataforma.Config;

import br.com.conectarena.plataforma.Model.CommunityPost;
import br.com.conectarena.plataforma.Model.Event;
import br.com.conectarena.plataforma.Model.Fornecedor;
import br.com.conectarena.plataforma.Model.Usuario;
import br.com.conectarena.plataforma.Repository.CommunityPostRepository;
import br.com.conectarena.plataforma.Repository.EventRepository;
import br.com.conectarena.plataforma.Repository.FornecedorRepository;
import br.com.conectarena.plataforma.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CommunityPostRepository postRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedFornecedores();
        seedEvents();
        seedPosts();
    }

    private void seedAdmin() {
        boolean adminExiste = usuarioRepository.findAll().stream()
                .anyMatch(u -> u.getRole().equals("ADMIN"));
        if (adminExiste) return;

        Usuario admin = new Usuario();
        admin.setNome("Administrador");
        admin.setEmail("admin@conectarena.com");
        admin.setSenha(passwordEncoder.encode("admin1234"));
        admin.setRole("ADMIN");
        admin.setConsentimentoLgpd(true);
        admin.setDataConsentimento(LocalDateTime.now());
        usuarioRepository.save(admin);
    }

    private void seedFornecedores() {
        if (fornecedorRepository.count() > 0) return;

        fornecedorRepository.save(buildFornecedor(
            "H2 Database Engine", "Banco de Dados",
            null, "support@h2database.com",
            true, "Banco de dados H2 utilizado em ambiente de desenvolvimento e testes."
        ));
        fornecedorRepository.save(buildFornecedor(
            "Unsplash", "CDN de Imagens",
            null, "support@unsplash.com",
            true, "Serviço de imagens de alta qualidade utilizado nos eventos da plataforma."
        ));
        fornecedorRepository.save(buildFornecedor(
            "DiceBear", "Geração de Avatares",
            null, "hello@dicebear.com",
            true, "API para geração de avatares de usuários automaticamente."
        ));
        fornecedorRepository.save(buildFornecedor(
            "QR Server", "Geração de QR Code",
            null, "info@qrserver.com",
            false, "Serviço externo para geração dos QR Codes dos ingressos. Conformidade LGPD pendente de verificação."
        ));
    }

    private Fornecedor buildFornecedor(String nome, String tipo, String cnpj,
                                        String email, boolean lgpd, String obs) {
        Fornecedor f = new Fornecedor();
        f.setNome(nome);
        f.setTipoServico(tipo);
        f.setCnpj(cnpj);
        f.setEmailContato(email);
        f.setConformeLgpd(lgpd);
        f.setStatus("ATIVO");
        f.setObservacoes(obs);
        f.setDataCadastro(LocalDateTime.now());
        return f;
    }

    private void seedEvents() {
        if (eventRepository.count() > 0) return;

        eventRepository.save(buildEvent(
            "Final do Campeonato Estadual",
            "A grande final do campeonato estadual. Não perca este confronto épico!",
            LocalDateTime.of(2026, 4, 15, 16, 0),
            "Estádio Arena", "futebol", "16:00",
            "https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBzdGFkaXVtJTIwZmllbGR8ZW58MXx8fHwxNzczNTMwMTE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
            75.0, 12500, 45000, true
        ));
        eventRepository.save(buildEvent(
            "Show Rock in Stadium",
            "O maior festival de rock do ano com bandas internacionais.",
            LocalDateTime.of(2026, 4, 20, 20, 0),
            "Estádio Arena", "musica", "20:00",
            "https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            150.0, 8000, 40000, true
        ));
        eventRepository.save(buildEvent(
            "Espetáculo Teatral: A Grande Peça",
            "Uma produção teatral única em formato arena no estádio.",
            LocalDateTime.of(2026, 4, 25, 19, 0),
            "Estádio Arena", "teatro", "19:00",
            "https://images.unsplash.com/photo-1609039504401-47ac3940f378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NzM1MTU1MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            90.0, 2500, 5000, false
        ));
        eventRepository.save(buildEvent(
            "Clássico Regional",
            "O maior clássico da região. Ambiente garantido!",
            LocalDateTime.of(2026, 5, 5, 18, 0),
            "Estádio Arena", "futebol", "18:00",
            "https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNyb3dkfGVufDF8fHx8MTc3MzUzMDExOXww&ixlib=rb-4.1.0&q=80&w=1080",
            60.0, 20000, 45000, false
        ));
        eventRepository.save(buildEvent(
            "Festival de Música Eletrônica",
            "Uma noite de música eletrônica com os melhores DJs do mundo.",
            LocalDateTime.of(2026, 5, 12, 22, 0),
            "Estádio Arena", "musica", "22:00",
            "https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            120.0, 15000, 35000, true
        ));
    }

    private void seedPosts() {
        if (postRepository.count() > 0) return;

        LocalDateTime now = LocalDateTime.now();

        postRepository.save(buildPost("system", "Maria Silva",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", true,
            "Quem vai no jogo de domingo? Estamos organizando uma caravana saindo do centro às 14h! 🚌⚽",
            null, 124, 18, now.minusHours(2), List.of("futebol", "caravana")));

        postRepository.save(buildPost("system", "João Santos",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao", false,
            "O show de ontem foi INCRÍVEL! Melhor experiência da minha vida no estádio 🎸🔥",
            "https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
            287, 42, now.minusHours(5), List.of("música", "show")));

        postRepository.save(buildPost("system", "Ana Costa",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", true,
            "Alguém tem ingressos extras para o clássico do mês que vem? Preciso de 2! 🙏",
            null, 45, 12, now.minusDays(1), List.of("futebol", "ingressos")));

        postRepository.save(buildPost("system", "Pedro Oliveira",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro", false,
            "Fizemos o tour VIP hoje e foi sensacional! Vale muito a pena conhecer os bastidores 🏟️",
            "https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
            156, 23, now.minusDays(2), List.of("tour", "visita")));

        postRepository.save(buildPost("system", "Carla Mendes",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla", true,
            "Grupo de WhatsApp para quem vai nos próximos eventos! Deixa o contato nos comentários 📱",
            null, 92, 67, now.minusDays(3), List.of("comunidade")));

        postRepository.save(buildPost("system", "Lucas Ferreira",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", false,
            "Primeira vez no estádio e já virei fã! Atmosfera incrível durante o jogo 🔴⚪",
            "https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNyb3dkfGVufDF8fHx8MTc3MzUzMDExOXww&ixlib=rb-4.1.0&q=80&w=1080",
            203, 31, now.minusDays(4), List.of("futebol", "primeira-vez")));
    }

    private Event buildEvent(String nome, String descricao, LocalDateTime data, String local,
                             String categoria, String horario, String imagemUrl,
                             Double preco, Integer disponiveis, Integer total, Boolean destaque) {
        Event e = new Event();
        e.setNome(nome); e.setDescricao(descricao); e.setData(data); e.setLocal(local);
        e.setCategoria(categoria); e.setHorario(horario); e.setImagemUrl(imagemUrl);
        e.setPreco(preco); e.setIngressosDisponiveis(disponiveis);
        e.setTotalIngressos(total); e.setDestaque(destaque);
        return e;
    }

    private CommunityPost buildPost(String authorId, String authorName, String authorAvatar,
                                    Boolean verified, String content, String imageUrl,
                                    int likes, int comments, LocalDateTime createdAt, List<String> tags) {
        CommunityPost p = new CommunityPost();
        p.setAuthorId(authorId); p.setAuthorName(authorName);
        p.setAuthorAvatar(authorAvatar); p.setAuthorVerified(verified);
        p.setContent(content); p.setImageUrl(imageUrl);
        p.setLikes(likes); p.setComments(comments);
        p.setCreatedAt(createdAt); p.setTags(tags);
        return p;
    }
}
