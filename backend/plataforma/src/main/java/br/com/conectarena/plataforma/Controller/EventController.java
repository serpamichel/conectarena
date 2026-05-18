package br.com.conectarena.plataforma.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.conectarena.plataforma.Model.Event;
import br.com.conectarena.plataforma.Service.EventService;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private static final Logger logger = Logger.getLogger(EventController.class.getName());

    @Autowired
    private EventService eventService;

    // Endpoint para criar um evento
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event savedEvent = eventService.createEvent(event);
        return ResponseEntity.ok(savedEvent);
    }

    // Endpoint para listar todos os eventos (deve vir antes de /{id})
    @GetMapping("/all")
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        logger.info("Retornando " + events.size() + " eventos no /all");
        return ResponseEntity.ok(events);
    }

    // Endpoint para buscar evento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        logger.info("Buscando evento por ID: " + id);
        Optional<Event> event = eventService.getEventById(id);
        return event.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para pesquisar eventos (página inicial)
    @GetMapping
    public ResponseEntity<List<Event>> searchEvents(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime data) {
        List<Event> events = eventService.searchEvents(nome, data);
        return ResponseEntity.ok(events);
    }

    // Endpoint de diagnóstico
    @GetMapping("/health/status")
    public ResponseEntity<java.util.Map<String, Object>> getStatus() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(java.util.Map.of(
            "status", "OK",
            "totalEventos", events.size(),
            "eventos", events
        ));
    }
}