package com.agromarket.interfaces.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.github.benmanes.caffeine.cache.Cache;
import java.util.Map;

@RestController
@RequestMapping("/api/divisas")
public class DivisaController {
    private final RestTemplate restTemplate;
    private final Cache<String, Double> divisaCache;

    public DivisaController(RestTemplate restTemplate, Cache<String, Double> divisaCache) {
        this.restTemplate = restTemplate;
        this.divisaCache = divisaCache;
    }

    @GetMapping("/conversion")
    public ResponseEntity<Map<String, Object>> getConversion(
            @RequestParam(defaultValue = "COP") String desde,
            @RequestParam String hacia) {
        String cacheKey = "divisa:" + hacia.toUpperCase();
        
        Double rateVal = divisaCache.get(cacheKey, key -> {
            Map<?, ?> response = restTemplate.getForObject("https://open.er-api.com/v6/latest/COP", Map.class);
            if (response == null) {
                throw new RuntimeException("Could not fetch exchange rates");
            }
            Map<?, ?> rates = (Map<?, ?>) response.get("rates");
            return Double.parseDouble(rates.get(hacia.toUpperCase()).toString());
        });

        double rate = rateVal != null ? rateVal : 1.0;

        return ResponseEntity.ok(Map.of(
            "desde", "COP",
            "hacia", hacia,
            "tasa", rate,
            "tasaCambio", rate,
            "tasa_cambio", rate,
            "actualizado", "Live"
        ));
    }
}
