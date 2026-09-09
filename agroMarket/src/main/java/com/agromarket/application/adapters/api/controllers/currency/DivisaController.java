package com.agromarket.application.adapters.api.controllers.currency;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.services.currency.ExchangeRateService;

@RestController
@RequestMapping({"/api/v1/divisas", "/api/divisas"})
public class DivisaController {

    private final ExchangeRateService exchangeRateService;

    public DivisaController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    @GetMapping("/tasas")
    public ResponseEntity<Map<String, Object>> getTasas() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("base", "COP");
        response.put("tasas", exchangeRateService.getRates());
        response.put("actualizadoEn", Instant.now().toString());
        response.put("fuente", "Frankfurter / ECB");
        response.put("tipo", "tasas de referencia diarias");

        return ResponseEntity.ok(response);
    }
}