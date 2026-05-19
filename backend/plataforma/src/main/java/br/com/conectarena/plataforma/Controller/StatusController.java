package br.com.conectarena.plataforma.Controller;

import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatusController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "status", "ok",
                "service", "plataforma",
                "timestamp", OffsetDateTime.now().toString());
    }

    @GetMapping("/status/health")
    public Map<String, Object> health() {
        String dbStatus;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbStatus = "UP";
        } catch (Exception e) {
            dbStatus = "DOWN";
        }

        String sistemaStatus = dbStatus.equals("UP") ? "UP" : "DEGRADED";

        return Map.of(
            "status", sistemaStatus,
            "timestamp", OffsetDateTime.now().toString(),
            "componentes", Map.of(
                "aplicacao", "UP",
                "bancoDeDados", dbStatus
            )
        );
    }
}