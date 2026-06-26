package com.agromarket.interfaces.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/divisas")
public class DivisaController {
    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<String, Double> cache = new ConcurrentHashMap<>();

    public DivisaController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/conversion")
    public ResponseEntity<Map<String, Object>> getConversion(
            @RequestParam(defaultValue = "COP") String desde,
            @RequestParam String hacia) {
        String cacheKey = "divisa:" + hacia.toUpperCase();
        double rate;

        if (cache.containsKey(cacheKey)) {
            rate = cache.get(cacheKey);
        } else {
            Map<?, ?> response = restTemplate.getForObject("https://open.er-api.com/v6/latest/COP", Map.class);
            if (response == null) {
                throw new RuntimeException("Could not fetch exchange rates");
            }
            Map<?, ?> rates = (Map<?, ?>) response.get("rates");
            rate = Double.parseDouble(rates.get(hacia.toUpperCase()).toString());
            cache.put(cacheKey, rate);
        }

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
