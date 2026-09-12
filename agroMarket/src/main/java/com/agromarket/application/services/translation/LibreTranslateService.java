package com.agromarket.application.services.translation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Servicio de traducción automática usando LibreTranslate.
 * 
 * LibreTranslate es una API de traducción automática open source y 100% gratuita.
 * Puedes usar instancias públicas gratuitas o auto-hospedar tu propia instancia.
 * 
 * Instancias públicas gratuitas:
 * - https://libretranslate.com (requiere API key para uso intensivo)
 * - https://translate.terraprint.co
 * - https://lt.vern.cc
 * - https://translate.fedilab.app
 * - https://trans.zillyhuhn.com
 * 
 * Para auto-hospedar (Docker):
 * docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
 */
@Service
public class LibreTranslateService {

    @Value("${libretranslate.url:https://translate.terraprint.co}")
    private String apiUrl;

    @Value("${libretranslate.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Traduce un texto de un idioma a otro.
     * 
     * @param text Texto a traducir
     * @param source Idioma origen (ej: "es", "auto" para detectar)
     * @param target Idioma destino (ej: "en", "pt", "fr", "de", "zh", "ar")
     * @return Texto traducido
     */
    public String translate(String text, String source, String target) {
        if (text == null || text.isBlank()) {
            return text;
        }

        try {
            String url = apiUrl + "/translate";

            Map<String, String> body = new HashMap<>();
            body.put("q", text);
            body.put("source", source != null ? source : "auto");
            body.put("target", target);
            body.put("format", "text");
            if (apiKey != null && !apiKey.isBlank()) {
                body.put("api_key", apiKey);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("translatedText");
            }
        } catch (Exception e) {
            // Si falla la traducción, devolver el texto original
            System.err.println("Error en traducción: " + e.getMessage());
        }

        return text;
    }

    /**
     * Detecta el idioma de un texto.
     */
    public String detectLanguage(String text) {
        if (text == null || text.isBlank()) {
            return "es";
        }

        try {
            String url = apiUrl + "/detect";

            Map<String, String> body = new HashMap<>();
            body.put("q", text);
            if (apiKey != null && !apiKey.isBlank()) {
                body.put("api_key", apiKey);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("language");
            }
        } catch (Exception e) {
            System.err.println("Error detectando idioma: " + e.getMessage());
        }

        return "es";
    }
}
