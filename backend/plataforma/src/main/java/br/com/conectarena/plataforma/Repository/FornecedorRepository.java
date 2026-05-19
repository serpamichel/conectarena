package br.com.conectarena.plataforma.Repository;

import br.com.conectarena.plataforma.Model.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
}
