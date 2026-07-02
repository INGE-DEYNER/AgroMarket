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

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final String systemPrompt = """
        Eres el asistente virtual de AgroMarket, la plataforma de ASAFRUT 
        que conecta productores de frutas tropicales de Urabá, Antioquia, 
        directamente con compradores. Ayudas con:
        - Información sobre productos (frutas tropicales de Urabá)
        - Estado de pedidos y envíos
        - Proceso de registro y verificación
        - Pagos y devoluciones
        - Contacto con productores
        Responde siempre en español, de forma amable y concisa (máximo 3 párrafos).
        Si no sabes algo específico de un pedido, pide el número de pedido.
        """;

    private final Map<String, String> fallbacks = Map.of(
        "pedido", "Para consultar tu pedido, ve a 'Mis Pedidos' en tu dashboard. Si tienes el número de pedido, nuestro equipo puede ayudarte en soporte@agro-market.app",
        "pago", "Aceptamos pagos simulados por PSE y tarjeta. Si tuviste un problema con un pago, escríbenos a soporte@agro-market.app",
        "producto", "Tenemos frutas tropicales frescas de Urabá: banano, maracuyá, aguacate, piña y más. Visita nuestro catálogo para ver disponibilidad y precios.",
        "envio", "Los envíos se calculan según la distancia. Recibirás actualizaciones del estado de tu envío por email.",
        "default", "Hola, soy el asistente de AgroMarket. ¿En qué puedo ayudarte hoy? Puedo ayudarte con pedidos, productos, pagos o información general."
    );

    private String getFallbackResponse(String mensaje) {
        String lower = mensaje != null ? mensaje.toLowerCase() : "";
        if (lower.contains("pedido")) {
            return fallbacks.get("pedido");
        } else if (lower.contains("pago")) {
            return fallbacks.get("pago");
        } else if (lower.contains("producto") || lower.contains("fruta") || lower.contains("banano") || lower.contains("aguacate") || lower.contains("maracuyá") || lower.contains("piña") || lower.contains("mango")) {
            return fallbacks.get("producto");
        } else if (lower.contains("envio") || lower.contains("envío") || lower.contains("entrega") || lower.contains("distancia")) {
            return fallbacks.get("envio");
        }
        return fallbacks.get("default");
    }

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
            if (mensaje.length() > 500) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mensaje demasiado largo (máximo 500 caracteres)"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> historial = (List<Map<String, Object>>) body.getOrDefault("historial", List.of());

            if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.startsWith("mock") || geminiApiKey.equals("changeme")) {
                return ResponseEntity.ok(Map.of("respuesta", getFallbackResponse(mensaje)));
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
                    "parts", List.of(Map.of("text", systemPrompt))
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
                System.err.println("Error en el chatbot de Gemini: " + e.getMessage());
                return ResponseEntity.ok(Map.of("respuesta", getFallbackResponse(mensaje)));
            }
        }, chatbotTaskExecutor);
    }
}
