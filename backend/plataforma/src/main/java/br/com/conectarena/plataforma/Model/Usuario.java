package br.com.conectarena.plataforma.Model;

import br.com.conectarena.plataforma.Config.CryptoConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Convert(converter = CryptoConverter.class)
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean consentimentoLgpd = false;

    @Column
    private LocalDateTime dataConsentimento;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column
    private LocalDateTime dataSolicitacaoExclusao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isConsentimentoLgpd() { return consentimentoLgpd; }
    public void setConsentimentoLgpd(boolean consentimentoLgpd) { this.consentimentoLgpd = consentimentoLgpd; }

    public LocalDateTime getDataConsentimento() { return dataConsentimento; }
    public void setDataConsentimento(LocalDateTime dataConsentimento) { this.dataConsentimento = dataConsentimento; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getDataSolicitacaoExclusao() { return dataSolicitacaoExclusao; }
    public void setDataSolicitacaoExclusao(LocalDateTime data) { this.dataSolicitacaoExclusao = data; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isEnabled() { return ativo; }
}
