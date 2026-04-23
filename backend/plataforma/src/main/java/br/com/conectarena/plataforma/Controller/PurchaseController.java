package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.Purchase;
import br.com.conectarena.plataforma.Service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody Map<String, Object> body) {
        try {
            Long eventoId = Long.valueOf(body.get("eventoId").toString());
            String userId = body.getOrDefault("userId", "anonimo").toString();
            String userName = body.getOrDefault("userName", "Usuário").toString();
            Integer quantidade = Integer.valueOf(body.get("quantidade").toString());
            String metodoPagamento = body.getOrDefault("metodoPagamento", "credit").toString();

            Purchase purchase = purchaseService.createPurchase(
                    eventoId, userId, userName, quantidade, metodoPagamento);
            return ResponseEntity.ok(purchase);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Purchase>> getPurchasesByUser(@PathVariable String userId) {
        return ResponseEntity.ok(purchaseService.getPurchasesByUser(userId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(purchaseService.getAnalytics());
    }
}
