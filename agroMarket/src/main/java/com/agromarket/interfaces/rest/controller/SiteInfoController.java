package com.agromarket.interfaces.rest.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class SiteInfoController {

    private final RestTemplate restTemplate;
    private final com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository usuarioJpaRepository;
    private final com.agromarket.infrastructure.persistence.repository.ProductoJpaRepository productoJpaRepository;
    private final com.agromarket.infrastructure.persistence.repository.ResenaJpaRepository resenaJpaRepository;

    @Value("${spring.application.name:AgroMarket}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    // Gemini API key — configura GEMINI_API_KEY en Railway
    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final java.util.concurrent.Executor chatbotTaskExecutor = 
        new java.util.concurrent.ThreadPoolExecutor(
            5,
            20,
            60L, java.util.concurrent.TimeUnit.SECONDS,
            new java.util.concurrent.LinkedBlockingQueue<>(100),
            new org.springframework.scheduling.concurrent.CustomizableThreadFactory("chatbot-")
        );

    @GetMapping("/site-info")
    public ResponseEntity<Map<String, Object>> siteInfo() {
        Map<String, Object> m = new HashMap<>();
        m.put("name", appName);
        m.put("version", appVersion);
        m.put("timestamp", Instant.now().toString());
        m.put("status", "ok");
        return ResponseEntity.ok(m);
    }

    /**
     * Endpoint público que devuelve la lista de productores registrados.
     * Solo expone datos públicos: nombre, ubicación, foto y calificación.
     */
    @GetMapping("/productores")
    public ResponseEntity<List<Map<String, Object>>> getProductores() {
        List<Map<String, Object>> productores = usuarioJpaRepository.findAllProductores().stream()
                .map(u -> {
                    Map<String, Object> p = new HashMap<>();
                    p.put("id", u.getId());
                    p.put("nombre", u.getNombre() != null ? u.getNombre() : "Productor ASAFRUT");
                    p.put("ubicacion", u.getUbicacion() != null ? u.getUbicacion() : "Urabá, Antioquia");
                    p.put("fotoUrl", u.getFotoUrl() != null ? u.getFotoUrl() : u.getFoto());
                    p.put("calificacionPromedio", u.getCalificacionPromedio());
                    return p;
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(productores);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        long totalProductos = productoJpaRepository.count();
        long totalProductores = usuarioJpaRepository.countProductores();

        // Calculate average price
        Double avgPriceVal = productoJpaRepository.getAveragePrice();
        long avgPrice = Math.round(avgPriceVal != null ? avgPriceVal : 0.0);

        // Calculate average rating
        Double avgRatingVal = resenaJpaRepository.getAverageRating();
        double avgRating = avgRatingVal != null ? avgRatingVal : 4.8;
        String calificacionStr = String.format(java.util.Locale.US, "%.1f★", avgRating);

        Map<String, Object> m = new HashMap<>();
        m.put("totalProductos", totalProductos);
        m.put("totalProductores", totalProductores > 0 ? totalProductores : 4);
        m.put("precioPromedio", avgPrice > 0 ? "$" + String.format("%,d", avgPrice).replace(',', '.') : "$3.338");
        m.put("calificacion", calificacionStr);
        return ResponseEntity.ok(m);
    }

    @PostMapping("/chatbot")
    public java.util.concurrent.CompletableFuture<ResponseEntity<?>> chatbot(@RequestBody Map<String, Object> body) {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            String mensaje = (String) body.get("mensaje");
            if (mensaje == null || mensaje.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
            }
            if (mensaje.length() > 2000) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mensaje demasiado largo"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> historial = (List<Map<String, Object>>) body.getOrDefault("historial", List.of());

            if (geminiApiKey == null || geminiApiKey.isEmpty()) {
                return ResponseEntity.ok(Map.of("respuesta", "La IA no está configurada. Por favor contacte soporte."));
            }

            List<Map<String, Object>> contents = new ArrayList<>();
            for (Map<String, Object> h : historial) {
                String role = String.valueOf(h.getOrDefault("role", "user"));
                String content = String.valueOf(h.getOrDefault("content", ""));
                String geminiRole = "assistant".equals(role) ? "model" : "user";
                contents.add(Map.of(
                    "role", geminiRole,
                    "parts", List.of(Map.of("text", content))
                ));
            }
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", mensaje))
            ));

            Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                    "parts", List.of(Map.of("text",
                        "Eres el asistente virtual de AgroMarket, plataforma de comercio agrícola de ASAFRUT " +
                        "en Chigorodó, Urabá, Colombia. Ayudas a compradores y productores con: " +
                        "información sobre productos agrícolas de Urabá, cómo registrarse y usar la plataforma, " +
                        "cómo hacer pedidos y pagos, cómo publicar productos (productores), " +
                        "estado de pedidos y envíos, y resolución de problemas técnicos. " +
                        "Responde siempre en el idioma del usuario. Sé amable, profesional y conciso. " +
                        "Si no sabes algo específico de la plataforma, di que lo escalarás al equipo de soporte. " +
                        "No uses emojis excesivos. Respuestas máximo 150 palabras."
                    ))
                ),
                "contents", contents,
                "generationConfig", Map.of(
                    "maxOutputTokens", 500,
                    "temperature", 0.7
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

            try {
                @SuppressWarnings("rawtypes")
                ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    Map.class
                );

                List<Map<?, ?>> candidates = (List<Map<?, ?>>) response.getBody().get("candidates");
                Map<?, ?> content = (Map<?, ?>) candidates.get(0).get("content");
                List<Map<?, ?>> parts = (List<Map<?, ?>>) content.get("parts");
                String respuesta = (String) parts.get(0).get("text");

                return ResponseEntity.ok(Map.of("respuesta", respuesta));
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Error en el chatbot de Gemini: " + e.getMessage());
                return ResponseEntity.ok(Map.of("respuesta", "Lo siento, hay un problema de conexión con el servicio de IA. Detalle: " + e.getMessage()));
            }
        }, chatbotTaskExecutor);
    }
}
