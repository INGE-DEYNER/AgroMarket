package com.agromarket.interfaces.rest.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;

@RestController
@RequestMapping("/api/public")
public class SiteInfoController {

    @Value("${spring.application.name:AgroMarket}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

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
    public ResponseEntity<?> chatbot(@RequestBody Map<String,Object> body) {
        String mensaje = (String) body.get("mensaje");
        List<Map<String,String>> historial = (List) body.getOrDefault("historial", List.of());

        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            return ResponseEntity.ok(Map.of("respuesta", "La IA no está configurada. Por favor contacte soporte."));
        }

        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String,String>> messages = new ArrayList<>(historial);
        messages.add(Map.of("role", "user", "content", mensaje));

        Map<String,Object> requestBody = Map.of(
            "model", "claude-3-5-sonnet-20241022",
            "max_tokens", 500,
            "system", "Eres el asistente virtual de AgroMarket, plataforma de comercio agrícola de ASAFRUT " +
                      "en Chigorodó, Urabá, Colombia. Ayudas a compradores y productores con: " +
                      "- Información sobre productos agrícolas de Urabá " +
                      "- Cómo registrarse y usar la plataforma " +
                      "- Cómo hacer pedidos y pagos " +
                      "- Cómo publicar productos (productores) " +
                      "- Estado de pedidos y envíos " +
                      "- Resolución de problemas técnicos " +
                      "- Cualquier pregunta general sobre agricultura y frutas " +
                      "Responde siempre en el idioma del usuario. Sé amable, profesional y conciso. " +
                      "Si no sabes algo específico de la plataforma, di que lo escalarás al equipo de soporte. " +
                      "No uses emojis excesivos. Respuestas máximo 150 palabras.",
            "messages", messages
        );

        try {
            ResponseEntity<Map> response = rt.exchange(
                "https://api.anthropic.com/v1/messages",
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );

            List<Map> content = (List) response.getBody().get("content");
            String respuesta = (String) content.get(0).get("text");
            return ResponseEntity.ok(Map.of("respuesta", respuesta));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("respuesta", "Lo siento, hay un problema de conexión con el servicio de IA. Inténtalo más tarde."));
        }
    }
}
