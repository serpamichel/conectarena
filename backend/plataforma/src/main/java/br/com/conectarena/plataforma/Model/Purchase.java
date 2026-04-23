package br.com.conectarena.plataforma.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "compras")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "evento_id", nullable = false)
    private Event evento;

    private String userId;
    private String userName;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private Double totalPago;

    private String metodoPagamento;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime dataCompra;

    private String codigoIngresso;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Event getEvento() { return evento; }
    public void setEvento(Event evento) { this.evento = evento; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public Double getTotalPago() { return totalPago; }
    public void setTotalPago(Double totalPago) { this.totalPago = totalPago; }

    public String getMetodoPagamento() { return metodoPagamento; }
    public void setMetodoPagamento(String metodoPagamento) { this.metodoPagamento = metodoPagamento; }

    public LocalDateTime getDataCompra() { return dataCompra; }
    public void setDataCompra(LocalDateTime dataCompra) { this.dataCompra = dataCompra; }

    public String getCodigoIngresso() { return codigoIngresso; }
    public void setCodigoIngresso(String codigoIngresso) { this.codigoIngresso = codigoIngresso; }
}
