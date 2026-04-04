package main.java.br.com.conectarena.plataforma.Repository;

import br.com.conectarena.plataforma.Model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Método para pesquisar eventos por nome (case insensitive)
    List<Event> findByNomeContainingIgnoreCase(String nome);

    // Método para pesquisar eventos por data
    List<Event> findByDataAfter(LocalDateTime data);

    // Método customizado para pesquisar por nome e data
    @Query("SELECT e FROM Event e WHERE LOWER(e.nome) LIKE LOWER(CONCAT('%', :nome, '%')) AND e.data >= :data")
    List<Event> findByNomeAndDataAfter(@Param("nome") String nome, @Param("data") LocalDateTime data);
}