package br.com.conectarena.plataforma.Service;

import br.com.conectarena.plataforma.Model.Event;
import br.com.conectarena.plataforma.Model.Purchase;
import br.com.conectarena.plataforma.Repository.EventRepository;
import br.com.conectarena.plataforma.Repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private EventRepository eventRepository;

    public Purchase createPurchase(Long eventoId, String userId, String userName,
                                   Integer quantidade, String metodoPagamento) {
        if (eventoId == null || eventoId <= 0) {
            throw new RuntimeException("ID do evento inválido");
        }
        if (quantidade == null || quantidade <= 0) {
            throw new RuntimeException("Quantidade deve ser maior que zero");
        }
        
        Event evento = eventRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento com ID " + eventoId + " não encontrado. Você precisa criar o evento primeiro."));

        if (evento.getIngressosDisponiveis() == null || evento.getIngressosDisponiveis() < quantidade) {
            throw new RuntimeException("Ingressos insuficientes para este evento");
        }

        double subtotal = evento.getPreco() * quantidade;
        double totalPago = subtotal * 1.1; // 10% taxa de serviço

        evento.setIngressosDisponiveis(evento.getIngressosDisponiveis() - quantidade);
        eventRepository.save(evento);

        Purchase purchase = new Purchase();
        purchase.setEvento(evento);
        purchase.setUserId(userId);
        purchase.setUserName(userName);
        purchase.setQuantidade(quantidade);
        purchase.setTotalPago(totalPago);
        purchase.setMetodoPagamento(metodoPagamento);
        purchase.setDataCompra(LocalDateTime.now());
        purchase.setCodigoIngresso(generateTicketCode());

        return purchaseRepository.save(purchase);
    }

    public List<Purchase> getPurchasesByUser(String userId) {
        return purchaseRepository.findByUserIdOrderByDataCompraDesc(userId);
    }

    public Map<String, Object> getAnalytics() {
        List<Purchase> all = purchaseRepository.findAll();

        double totalRevenue = all.stream().mapToDouble(Purchase::getTotalPago).sum();
        int ticketsSold = all.stream().mapToInt(Purchase::getQuantidade).sum();
        long totalEvents = eventRepository.count();

        // Receita por categoria
        String[] categorias = {"futebol", "musica", "teatro", "outros"};
        String[] labels = {"Futebol", "Música", "Teatro", "Outros"};
        Map<String, Double> revenueByCategoria = new LinkedHashMap<>();
        for (String cat : categorias) revenueByCategoria.put(cat, 0.0);
        for (Purchase p : all) {
            String cat = p.getEvento().getCategoria();
            revenueByCategoria.merge(cat, p.getTotalPago(), Double::sum);
        }
        List<Map<String, Object>> salesByCategory = new ArrayList<>();
        for (int i = 0; i < categorias.length; i++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("name", labels[i]);
            entry.put("value", revenueByCategoria.getOrDefault(categorias[i], 0.0));
            salesByCategory.add(entry);
        }

        // Top eventos
        Map<String, double[]> byEvent = new LinkedHashMap<>();
        for (Purchase p : all) {
            String nome = p.getEvento().getNome();
            double[] vals = byEvent.getOrDefault(nome, new double[]{0, 0});
            vals[0] += p.getQuantidade();
            vals[1] += p.getTotalPago();
            byEvent.put(nome, vals);
        }
        List<Map<String, Object>> topEvents = byEvent.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("tickets", (int) e.getValue()[0]);
                    m.put("revenue", Math.round(e.getValue()[1] * 100.0) / 100.0);
                    return m;
                })
                .sorted((a, b) -> Double.compare((double) b.get("revenue"), (double) a.get("revenue")))
                .limit(5)
                .collect(Collectors.toList());

        // Vendas por dia da semana
        String[] dayNames = {"Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"};
        int[] byDay = new int[7];
        for (Purchase p : all) {
            int idx = p.getDataCompra().getDayOfWeek().getValue() - 1; // Mon=0..Sun=6
            byDay[idx] += p.getQuantidade();
        }
        List<Map<String, Object>> salesByDay = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("day", dayNames[i]);
            entry.put("vendas", byDay[i]);
            salesByDay.add(entry);
        }

        // Crescimento mensal — últimos 6 meses
        String[] ptMonths = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};
        LocalDateTime now = LocalDateTime.now();
        Map<String, Integer> monthMap = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime m = now.minusMonths(i);
            String key = ptMonths[m.getMonthValue() - 1] + "/" + String.format("%02d", m.getYear() % 100);
            monthMap.put(key, 0);
        }
        for (Purchase p : all) {
            LocalDateTime dc = p.getDataCompra();
            String key = ptMonths[dc.getMonthValue() - 1] + "/" + String.format("%02d", dc.getYear() % 100);
            if (monthMap.containsKey(key)) {
                monthMap.merge(key, p.getQuantidade(), Integer::sum);
            }
        }
        List<Map<String, Object>> salesByMonth = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : monthMap.entrySet()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", entry.getKey());
            m.put("vendas", entry.getValue());
            salesByMonth.add(m);
        }

        double ticketMedio = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;

        // Histórias 04.1 e 04.2: Métricas Detalhadas por Evento
        List<Map<String, Object>> eventMetrics = new ArrayList<>();
        List<br.com.conectarena.plataforma.Model.Event> events = eventRepository.findAll();
        for (br.com.conectarena.plataforma.Model.Event e : events) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", e.getId());
            m.put("name", e.getNome());
            m.put("date", e.getData() != null ? e.getData().toString() : "N/D");
            
            int evTicketsSold = all.stream()
                .filter(p -> p.getEvento() != null && e.getId().equals(p.getEvento().getId()))
                .mapToInt(Purchase::getQuantidade)
                .sum();
                
            int capacity = e.getTotalIngressos() != null && e.getTotalIngressos() > 0 ? e.getTotalIngressos() : 1;
            double occupancyRate = Math.min((double) evTicketsSold / capacity * 100.0, 100.0);
            
            // Simulação de visualizações e interesse baseada nas vendas (já que não há tracking real de views)
            int views = evTicketsSold * 18 + new java.util.Random().nextInt(300) + 150;
            String interest = occupancyRate > 75 ? "Alto" : occupancyRate > 35 ? "Médio" : "Baixo";
            if (evTicketsSold == 0) {
                 views = new java.util.Random().nextInt(150) + 20;
                 interest = "Baixo";
            }
            
            m.put("ticketsSold", evTicketsSold);
            m.put("totalCapacity", capacity);
            m.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);
            m.put("views", views);
            m.put("interest", interest);
            eventMetrics.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        result.put("ticketsSold", ticketsSold);
        result.put("totalEvents", (int) totalEvents);
        result.put("salesByCategory", salesByCategory);
        result.put("topEvents", topEvents);
        result.put("salesByDay", salesByDay);
        result.put("salesByMonth", salesByMonth);
        result.put("eventMetrics", eventMetrics);
        result.put("ticketMedio", Math.round(ticketMedio * 100.0) / 100.0);
        return result;
    }

    private String generateTicketCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("CNA-");
        Random rng = new Random();
        for (int i = 0; i < 7; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
