package com.agromarket.application.adapters.api.controllers;

import com.agromarket.application.services.translation.LibreTranslateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint de traducción automática usando LibreTranslate.
 * 
 * POST /api/v1/translation/translate
 * Body: { "text": "Hola mundo", "source": "es", "target": "en" }
 * Response: { "translatedText": "Hello world" }
 */
@RestController
@RequestMapping("/api/v1/translation")
public class TranslationController {

    private final LibreTranslateService libreTranslateService;

    public TranslationController(LibreTranslateService libreTranslateService) {
        this.libreTranslateService = libreTranslateService;
    }

    @PostMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(@RequestBody Map<String, String> request) {
        String text = request.getOrDefault("text", "");
        String source = request.getOrDefault("source", "auto");
        String target = request.getOrDefault("target", "en");

        String translated = libreTranslateService.translate(text, source, target);

        Map<String, String> response = new HashMap<>();
        response.put("translatedText", translated);
        response.put("source", source);
        response.put("target", target);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/detect")
    public ResponseEntity<Map<String, String>> detect(@RequestBody Map<String, String> request) {
        String text = request.getOrDefault("text", "");
        String detected = libreTranslateService.detectLanguage(text);

        Map<String, String> response = new HashMap<>();
        response.put("language", detected);

        return ResponseEntity.ok(response);
    }
}
