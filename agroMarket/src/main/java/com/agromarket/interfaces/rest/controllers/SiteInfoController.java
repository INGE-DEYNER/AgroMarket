package com.agromarket.interfaces.rest.controllers;

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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.agromarket.infrastructure.persistence.sql.entities.UserEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.ProductJpaRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.ReviewJpaRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.UserJpaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST para endpoints públicos de información del sitio.
 * Proporciona información general sobre AgroMarket, listado de productores y métricas.
 * 
 * @author AgroMarket Team
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class SiteInfoController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SiteInfoController.class);

    private final RestTemplate restTemplate;
    private final UserJpaRepository userJpaRepository;
    private final ProductJpaRepository productJpaRepository;
    private final ReviewJpaRepository reviewJpaRepository;

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
        "descuento", "Contamos con una sección de ofertas y promociones especiales en nuestro catálogo de frutas tropicales. ¡Busca los productos marcados con la etiqueta % PROMO!",
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
        } else if (lower.contains("descuento") || lower.contains("oferta") || lower.contains("promo") || lower.contains("descuentos") || lower.contains("precio")) {
            return fallbacks.get("descuento");
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
    @GetMapping("/producers")
    public ResponseEntity<List<Map<String, Object>>> getProducers() {
        List<Map<String, Object>> producers = userJpaRepository.findAllProducers().stream()
                .map(u -> {
                    Map<String, Object> p = new HashMap<>();
                    p.put("id", u.getId());
                    p.put("name", u.getFirstName() != null ? u.getFirstName() : "Productor ASAFRUT");
                    p.put("location", u.getLocation() != null ? u.getLocation() : "Urabá, Antioquia");
                    p.put("photoUrl", u.getPhotoUrl() != null ? u.getPhotoUrl() : u.getFoto());
                    p.put("averageRating", u.getAverageRating());
                    return p;
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(producers);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        long totalProducts = productJpaRepository.count();
        long totalProducers = userJpaRepository.countProducers();

        // Calculate average price
        Double avgPriceVal = productJpaRepository.getAveragePrice();
        long avgPrice = Math.round(avgPriceVal != null ? avgPriceVal : 0.0);

        // Calculate average rating
        Double avgRatingVal = reviewJpaRepository.getAverageRating();
        double avgRating = avgRatingVal != null ? avgRatingVal : 4.8;
        String ratingStr = String.format(java.util.Locale.US, "%.1f★", avgRating);

        Map<String, Object> m = new HashMap<>();
        m.put("totalProducts", totalProducts);
        m.put("totalProducers", totalProducers > 0 ? totalProducers : 4);
        m.put("averagePrice", avgPrice > 0 ? "$" + String.format("%,d", avgPrice).replace(',', '.') : "$3.338");
        m.put("rating", ratingStr);
        return ResponseEntity.ok(m);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<?> chatbot(@RequestBody Map<String, String> body,
                                     @RequestHeader(value = "X-Gemini-Key", required = false) String customApiKey) {
        String mensaje = body.getOrDefault("mensaje", "").trim();
        
        if (mensaje.isEmpty() || mensaje.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("respuesta", 
                "Por favor escribe un mensaje válido (máximo 500 caracteres)."));
        }
        
        try {
            String systemContext = """
                Eres el asistente virtual de AgroMarket, plataforma de ASAFRUT que conecta 
                productores de frutas tropicales de Urabá, Antioquia, Colombia, con compradores.
                Responde SIEMPRE en español. Sé amable, conciso y útil.
                Solo respondes sobre: productos agrícolas, pedidos, envíos, pagos, registro, 
                productores de Urabá, frutas tropicales colombianas.
                Si preguntan algo fuera de tema, redirígelos amablemente al tema de AgroMarket.
                Máximo 3 párrafos por respuesta.
                """;
            
            Map<String, Object> geminiRequest = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(
                        Map.of("text", systemContext + "\n\nUsuario: " + mensaje)
                    )
                )),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 500,
                    "topP", 0.8
                )
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String keyToUse = (customApiKey != null && !customApiKey.isBlank()) ? customApiKey : geminiApiKey;
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + keyToUse,
                new HttpEntity<>(geminiRequest, headers),
                Map.class
            );
            
            String respuesta = extraerTextoGemini(response.getBody());
            return ResponseEntity.ok(Map.of("respuesta", respuesta));
            
        } catch (Exception e) {
            log.error("Error en chatbot Gemini: {}", e.getMessage());
            String respuestaFallback = obtenerRespuestaFallback(mensaje);
            return ResponseEntity.ok(Map.of("respuesta", respuestaFallback));
        }
    }

    private String extraerTextoGemini(Map<?, ?> body) {
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> part = (Map<?, ?>) parts.get(0);
            return (String) part.get("text");
        } catch (Exception e) {
            return "Hola, soy el asistente de AgroMarket. ¿En qué puedo ayudarte?";
        }
    }

    private String obtenerRespuestaFallback(String mensaje) {
        String lower = mensaje.toLowerCase();
        if (lower.contains("pedido") || lower.contains("orden")) 
            return "Para consultar tu pedido ve a 'Mis Pedidos' en tu dashboard. ¿Tienes el número de pedido?";
        if (lower.contains("pago") || lower.contains("pagar"))
            return "Aceptamos PSE, tarjeta de crédito/débito, Nequi y Daviplata. ¿Tuviste algún problema con tu pago?";
        if (lower.contains("envio") || lower.contains("envío") || lower.contains("entrega"))
            return "Los envíos desde Chigorodó toman 1-4 días según tu ciudad. Recibirás actualizaciones por email.";
        if (lower.contains("producto") || lower.contains("fruta"))
            return "Tenemos frutas tropicales frescas de Urabá: banano, maracuyá, aguacate, piña, papaya y más. ¡Visita nuestro catálogo!";
        if (lower.contains("registro") || lower.contains("cuenta"))
            return "Puedes registrarte como comprador, empresa o productor. El proceso toma menos de 2 minutos.";
        return "Hola, soy el asistente de AgroMarket. Puedo ayudarte con pedidos, productos, pagos o envíos. ¿Qué necesitas?";
    }
}
