package br.com.conectarena.plataforma.Controller;

import br.com.conectarena.plataforma.Model.Purchase;
import br.com.conectarena.plataforma.Service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseController {

    private static final Logger logger = Logger.getLogger(PurchaseController.class.getName());

    @Autowired
    private PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody Map<String, Object> body) {
        logger.info("Recebido POST /api/purchases com body: " + body);
        try {
            if (body.get("eventoId") == null) {
                return ResponseEntity.badRequest().body(Map.of("erro", "ID do evento é obrigatório"));
            }
            
            Long eventoId = Long.valueOf(body.get("eventoId").toString());
            String userId = body.getOrDefault("userId", "anonimo").toString();
            String userName = body.getOrDefault("userName", "Usuário").toString();
            Integer quantidade = Integer.valueOf(body.get("quantidade").toString());
            String metodoPagamento = body.getOrDefault("metodoPagamento", "credit").toString();

            logger.info("Tentando criar compra: eventoId=" + eventoId + ", userId=" + userId + ", quantidade=" + quantidade);

            Purchase purchase = purchaseService.createPurchase(
                    eventoId, userId, userName, quantidade, metodoPagamento);
            logger.info("Compra criada com sucesso: " + purchase.getId());
            return ResponseEntity.ok(purchase);
        } catch (NumberFormatException e) {
            logger.severe("Erro de formato: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", "Formato de dados inválido: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.severe("Erro de runtime: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            logger.severe("Erro geral: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("erro", "Erro ao processar compra: " + e.getMessage()));
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
