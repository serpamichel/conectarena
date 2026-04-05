package br.com.conectarena.plataforma.Resource;

import java.time.LocalDateTime;

public class EventDTO {

    private Long id;
    private String nome;
    private String descricao;
    private LocalDateTime data;
    private String local;

    // Construtores
    public EventDTO() {
    }

    public EventDTO(Long id, String nome, String descricao, LocalDateTime data, String local) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.local = local;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }
}