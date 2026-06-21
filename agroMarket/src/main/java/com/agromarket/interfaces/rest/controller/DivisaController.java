package com.agromarket.interfaces.rest.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/divisas")
public class DivisaController {

    private final RestTemplate restTemplate;
    private final StringRedisTemplate redisTemplate;

    public DivisaController(RestTemplate restTemplate, StringRedisTemplate redisTemplate) {
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/conversion")
    public ResponseEntity<Map<String, Object>> getConversion(
            @RequestParam(defaultValue = "COP") String desde,
            @RequestParam String hacia) {
        String cacheKey = "divisa:" + hacia.toUpperCase();
        String cachedRate = redisTemplate.opsForValue().get(cacheKey);

        double rate;
        if (cachedRate != null) {
            rate = Double.parseDouble(cachedRate);
        } else {
            Map<?, ?> response = restTemplate.getForObject("https://open.er-api.com/v6/latest/COP", Map.class);
            if (response == null) {
                throw new RuntimeException("Could not fetch exchange rates");
            }
            Map<?, ?> rates = (Map<?, ?>) response.get("rates");
            rate = Double.parseDouble(rates.get(hacia.toUpperCase()).toString());
            redisTemplate.opsForValue().set(cacheKey, String.valueOf(rate), 1, TimeUnit.HOURS);
        }

        return ResponseEntity.ok(Map.of(
            "desde", "COP",
            "hacia", hacia,
            "tasa", rate,
            "tasaCambio", rate,
            "tasa_cambio", rate,
            "actualizado", "Cached/Live"
        ));
    }
}
