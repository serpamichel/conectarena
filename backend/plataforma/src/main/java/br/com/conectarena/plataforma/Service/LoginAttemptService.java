package br.com.conectarena.plataforma.Service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_TENTATIVAS = 5;
    private static final int MINUTOS_BLOQUEIO = 15;

    private final ConcurrentHashMap<String, Integer> tentativas = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> bloqueados = new ConcurrentHashMap<>();

    public boolean estaBloqueado(String email) {
        LocalDateTime bloqueadoAte = bloqueados.get(email);
        if (bloqueadoAte == null) return false;

        if (LocalDateTime.now().isAfter(bloqueadoAte)) {
            bloqueados.remove(email);
            tentativas.remove(email);
            return false;
        }
        return true;
    }

    public LocalDateTime getBloqueadoAte(String email) {
        return bloqueados.get(email);
    }

    public void registrarFalha(String email) {
        int total = tentativas.getOrDefault(email, 0) + 1;
        tentativas.put(email, total);
        if (total >= MAX_TENTATIVAS) {
            bloqueados.put(email, LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEIO));
            tentativas.remove(email);
        }
    }

    public void registrarSucesso(String email) {
        tentativas.remove(email);
        bloqueados.remove(email);
    }

    public int getTentativasRestantes(String email) {
        int feitas = tentativas.getOrDefault(email, 0);
        return MAX_TENTATIVAS - feitas;
    }
}
