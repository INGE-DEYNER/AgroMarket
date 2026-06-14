package com.agromarket.interfaces.rest.controller;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/divisas")
public class DivisaController {

    @GetMapping("/conversion")
    @Cacheable(value = "divisas", key = "#hacia")
    public ResponseEntity<Map<String, Object>> getConversion(
            @RequestParam(defaultValue = "COP") String desde,
            @RequestParam String hacia) {
        RestTemplate rt = new RestTemplate();
        Map<?, ?> response = rt.getForObject("https://open.er-api.com/v6/latest/COP", Map.class);
        if (response == null) {
            throw new RuntimeException("Could not fetch exchange rates");
        }
        Map<?, ?> rates = (Map<?, ?>) response.get("rates");
        double rate = Double.parseDouble(rates.get(hacia.toUpperCase()).toString());
        return ResponseEntity.ok(Map.of(
            "desde", "COP",
            "hacia", hacia,
            "tasa", rate,
            "tasaCambio", rate,
            "tasa_cambio", rate,
            "actualizado", response.get("time_last_update_utc")
        ));
    }
}
