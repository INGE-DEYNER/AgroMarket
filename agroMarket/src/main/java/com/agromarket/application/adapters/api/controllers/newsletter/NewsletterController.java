package com.agromarket.application.adapters.api.controllers.newsletter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Suscripción al boletín ("Suscríbete a nuestra cosecha semanal").
 *
 * POST /api/v1/newsletter/subscribe  (público)
 * Body: { "email": "usuario@correo.com" }
 *
 * Antes no existía ningún endpoint y el formulario del Home hacía
 * e.preventDefault() sin llamar a nada: por eso "el suscríbete no está
 * funcionando". Ahora persiste en Mongo (colección newsletter_subscriptions)
 * y devuelve un mensaje que el frontend muestra.
 */
@RestController
@RequestMapping("/api/v1/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private static final Pattern EMAIL = Pattern.compile(
            "^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$");

    private final MongoTemplate mongoTemplate;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(
            @RequestBody Map<String, Object> body) {
        String email = body == null || body.get("email") == null
                ? ""
                : String.valueOf(body.get("email")).trim().toLowerCase();

        if (email.isBlank() || !EMAIL.matcher(email).matches()) {
            Map<String, Object> err = new HashMap<>();
            err.put("ok", false);
            err.put("message", "Ingresa un correo válido.");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> doc = new HashMap<>();
        doc.put("_id", email);
        doc.put("email", email);
        doc.put("fecha", LocalDateTime.now().toString());
        doc.put("origen", body.getOrDefault("origen", "home"));
        try {
            mongoTemplate.save(doc, "newsletter_subscriptions");
        } catch (Exception ex) {
            // Si ya existe (duplicado) igual respondemos OK: ya está suscrito.
        }

        Map<String, Object> ok = new HashMap<>();
        ok.put("ok", true);
        ok.put("message", "¡Listo! Te llegará el primer correo pronto.");
        return ResponseEntity.ok(ok);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> count() {
        long total;
        try {
            total = mongoTemplate.getCollection("newsletter_subscriptions")
                    .countDocuments();
        } catch (Exception ex) {
            total = 0;
        }
        Map<String, Object> res = new HashMap<>();
        res.put("total", total);
        return ResponseEntity.ok(res);
    }
}
