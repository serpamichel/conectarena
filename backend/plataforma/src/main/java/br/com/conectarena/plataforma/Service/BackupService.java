package br.com.conectarena.plataforma.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class BackupService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String PASTA_BACKUP = "backups";
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Scheduled(cron = "0 0 2 * * ?")
    public String backupAutomatico() {
        return realizarBackup("automatico");
    }

    public String realizarBackup(String tipo) {
        File pasta = new File(PASTA_BACKUP);
        if (!pasta.exists()) {
            pasta.mkdirs();
        }

        String timestamp = LocalDateTime.now().format(FORMATO);
        String nomeArquivo = PASTA_BACKUP + "/conectarena-" + tipo + "-" + timestamp + ".zip";

        String caminhoAbsoluto = new File(nomeArquivo).getAbsolutePath();
        jdbcTemplate.execute("BACKUP TO '" + caminhoAbsoluto + "'");

        return nomeArquivo;
    }

    public List<String> listarBackups() {
        File pasta = new File(PASTA_BACKUP);
        if (!pasta.exists() || !pasta.isDirectory()) {
            return Collections.emptyList();
        }

        File[] arquivos = pasta.listFiles((dir, nome) -> nome.endsWith(".zip"));
        if (arquivos == null) return Collections.emptyList();

        return Arrays.stream(arquivos)
                .sorted((a, b) -> Long.compare(b.lastModified(), a.lastModified()))
                .map(File::getName)
                .toList();
    }
}
