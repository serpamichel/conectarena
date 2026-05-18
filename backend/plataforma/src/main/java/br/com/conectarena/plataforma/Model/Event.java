package br.com.conectarena.plataforma.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime data;

    private String local;
    private String categoria;
    private String horario;

    @Column(length = 2000)
    private String imagemUrl;

    private Double preco;
    private Integer ingressosDisponiveis;
    private Integer totalIngressos;
    private Boolean destaque;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime destaqueExpiraEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }

    public Integer getIngressosDisponiveis() { return ingressosDisponiveis; }
    public void setIngressosDisponiveis(Integer v) { this.ingressosDisponiveis = v; }

    public Integer getTotalIngressos() { return totalIngressos; }
    public void setTotalIngressos(Integer v) { this.totalIngressos = v; }

    public Boolean getDestaque() { return destaque; }
    public void setDestaque(Boolean destaque) { this.destaque = destaque; }

    public LocalDateTime getDestaqueExpiraEm() { return destaqueExpiraEm; }
    public void setDestaqueExpiraEm(LocalDateTime destaqueExpiraEm) { this.destaqueExpiraEm = destaqueExpiraEm; }
}
