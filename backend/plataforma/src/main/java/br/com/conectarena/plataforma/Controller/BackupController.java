package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    @Autowired
    private BackupService backupService;

    @PostMapping("/executar")
    public ResponseEntity<?> executarBackup() {
        try {
            String arquivo = backupService.realizarBackup("manual");
            return ResponseEntity.ok(Map.of(
                "mensagem", "Backup realizado com sucesso",
                "arquivo", arquivo
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("erro", "Falha ao realizar backup: " + e.getMessage()));
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<String>> listarBackups() {
        return ResponseEntity.ok(backupService.listarBackups());
    }
}
