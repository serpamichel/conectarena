package br.com.conectarena.plataforma.Repository;

import br.com.conectarena.plataforma.Model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByUserIdOrderByDataCompraDesc(String userId);
}
