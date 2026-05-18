package br.com.conectarena.plataforma.Service;

import br.com.conectarena.plataforma.Model.Event;
import br.com.conectarena.plataforma.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    // Criar um novo evento
    public Event createEvent(Event event) {
        if (event.getData() != null) {
            java.time.LocalDateTime startOfDay = event.getData().toLocalDate().atStartOfDay();
            java.time.LocalDateTime endOfDay = event.getData().toLocalDate().atTime(23, 59, 59);

            if (eventRepository.existsByDataBetween(startOfDay, endOfDay)) {
                throw new IllegalStateException("A Arena já possui um evento agendado para esta data. Solicitamos alterar o calendário da atividade.");
            }
        }
        
        if (Boolean.TRUE.equals(event.getDestaque())) {
            event.setDestaqueExpiraEm(LocalDateTime.now().plusDays(7));
        }
        
        return eventRepository.save(event);
    }

    // Pesquisar eventos por nome
    public List<Event> searchEventsByName(String nome) {
        return eventRepository.findByNomeContainingIgnoreCase(nome);
    }

    // Pesquisar eventos por data (eventos futuros)
    public List<Event> searchEventsByDate(LocalDateTime data) {
        return eventRepository.findByDataAfter(data);
    }

    // Pesquisar eventos por nome e data
    public List<Event> searchEvents(String nome, LocalDateTime data) {
        if (nome != null && !nome.isEmpty() && data != null) {
            return eventRepository.findByNomeAndDataAfter(nome, data);
        } else if (nome != null && !nome.isEmpty()) {
            return searchEventsByName(nome);
        } else if (data != null) {
            return searchEventsByDate(data);
        } else {
            return eventRepository.findAll();
        }
    }

    // Buscar evento por ID
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    // Listar todos os eventos
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}