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

    // Usa el bean RestTemplate con timeouts configurados — no instanciar por request
    private final RestTemplate restTemplate;

    @Value("${spring.application.name:AgroMarket}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    // Gemini API key — configura GEMINI_API_KEY en Railway
    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @GetMapping("/site-info")
    public ResponseEntity<Map<String, Object>> siteInfo() {
        Map<String, Object> m = new HashMap<>();
        m.put("name", appName);
        m.put("version", appVersion);
        m.put("timestamp", Instant.now().toString());
        m.put("status", "ok");
        return ResponseEntity.ok(m);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<?> chatbot(@RequestBody Map<String, Object> body) {
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

        // Gemini REST API — no requiere SDK, solo HTTP
        // Convierte historial de formato {role, content} → {role, parts:[{text}]}
        // Gemini usa "model" en lugar de "assistant" para el rol del asistente
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
        // Agrega el mensaje actual del usuario
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

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );

            // Estructura respuesta Gemini: candidates[0].content.parts[0].text
            @SuppressWarnings("unchecked")
            List<Map<?, ?>> candidates = (List<Map<?, ?>>) response.getBody().get("candidates");
            @SuppressWarnings("unchecked")
            Map<?, ?> content = (Map<?, ?>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<?, ?>> parts = (List<Map<?, ?>>) content.get("parts");
            String respuesta = (String) parts.get(0).get("text");

            return ResponseEntity.ok(Map.of("respuesta", respuesta));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("respuesta", "Lo siento, hay un problema de conexión con el servicio de IA. Inténtalo más tarde."));
        }
    }
}
