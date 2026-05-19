package br.com.conectarena.plataforma.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fornecedores")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String tipoServico;

    @Column
    private String cnpj;

    @Column
    private String emailContato;

    @Column(nullable = false)
    private boolean conformeLgpd = false;

    @Column(nullable = false)
    private String status = "ATIVO";

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    private LocalDateTime dataCadastro;

    @Column
    private LocalDateTime dataAtualizacao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTipoServico() { return tipoServico; }
    public void setTipoServico(String tipoServico) { this.tipoServico = tipoServico; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getEmailContato() { return emailContato; }
    public void setEmailContato(String emailContato) { this.emailContato = emailContato; }

    public boolean isConformeLgpd() { return conformeLgpd; }
    public void setConformeLgpd(boolean conformeLgpd) { this.conformeLgpd = conformeLgpd; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}
