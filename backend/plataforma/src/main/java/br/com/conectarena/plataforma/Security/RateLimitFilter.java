package br.com.conectarena.plataforma.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUISICOES_POR_MINUTO = 100;

    // Guarda: IP -> [número de requisições, início do período]
    private final ConcurrentHashMap<String, int[]> contadores = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> inicioJanela = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String ip = obterIp(request);
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicio = inicioJanela.getOrDefault(ip, agora);

        // Se passou 1 minuto desde o início da janela, reseta o contador
        if (inicio.plusMinutes(1).isBefore(agora)) {
            contadores.remove(ip);
            inicioJanela.put(ip, agora);
        }

        int[] contador = contadores.computeIfAbsent(ip, k -> new int[]{0});
        inicioJanela.putIfAbsent(ip, agora);
        contador[0]++;

        if (contador[0] > MAX_REQUISICOES_POR_MINUTO) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"erro\": \"Muitas requisições. Tente novamente em instantes.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String obterIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        // X-Forwarded-For pode ter múltiplos IPs separados por vírgula; pega o primeiro
        return ip.split(",")[0].trim();
    }
}
