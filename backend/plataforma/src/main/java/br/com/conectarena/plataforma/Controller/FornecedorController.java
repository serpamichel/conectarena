package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.Fornecedor;
import br.com.conectarena.plataforma.Repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @GetMapping
    public ResponseEntity<List<Fornecedor>> listar() {
        return ResponseEntity.ok(fornecedorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Fornecedor fornecedor) {
        if (fornecedor.getNome() == null || fornecedor.getNome().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nome do fornecedor é obrigatório"));
        }
        if (fornecedor.getTipoServico() == null || fornecedor.getTipoServico().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Tipo de serviço é obrigatório"));
        }
        fornecedor.setDataCadastro(LocalDateTime.now());
        fornecedor.setStatus("ATIVO");
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorRepository.save(fornecedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Fornecedor dados) {
        Optional<Fornecedor> opt = fornecedorRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Fornecedor não encontrado"));
        }
        Fornecedor fornecedor = opt.get();
        if (dados.getNome() != null) fornecedor.setNome(dados.getNome());
        if (dados.getTipoServico() != null) fornecedor.setTipoServico(dados.getTipoServico());
        if (dados.getCnpj() != null) fornecedor.setCnpj(dados.getCnpj());
        if (dados.getEmailContato() != null) fornecedor.setEmailContato(dados.getEmailContato());
        if (dados.getObservacoes() != null) fornecedor.setObservacoes(dados.getObservacoes());
        if (dados.getStatus() != null) fornecedor.setStatus(dados.getStatus());
        fornecedor.setConformeLgpd(dados.isConformeLgpd());
        fornecedor.setDataAtualizacao(LocalDateTime.now());
        return ResponseEntity.ok(fornecedorRepository.save(fornecedor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> desativar(@PathVariable Long id) {
        Optional<Fornecedor> opt = fornecedorRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Fornecedor não encontrado"));
        }
        Fornecedor fornecedor = opt.get();
        fornecedor.setStatus("INATIVO");
        fornecedor.setDataAtualizacao(LocalDateTime.now());
        return ResponseEntity.ok(fornecedorRepository.save(fornecedor));
    }
}
