package com.agromarket.interfaces.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/divisas")
public class DivisaController {
    
    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<String, TasaDivisa> cache = new ConcurrentHashMap<>();
    private LocalDateTime ultimaActualizacion = null;
    
    public DivisaController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public static class TasaDivisa {
        private String divisa;
        private double tasa;
        private LocalDateTime actualizacion;

        public TasaDivisa() {}

        public TasaDivisa(String divisa, double tasa, LocalDateTime actualizacion) {
            this.divisa = divisa;
            this.tasa = tasa;
            this.actualizacion = actualizacion;
        }

        public String getDivisa() { return divisa; }
        public void setDivisa(String divisa) { this.divisa = divisa; }
        public double getTasa() { return tasa; }
        public void setTasa(double tasa) { this.tasa = tasa; }
        public LocalDateTime getActualizacion() { return actualizacion; }
        public void setActualizacion(LocalDateTime actualizacion) { this.actualizacion = actualizacion; }
    }

    @GetMapping("/tasas")
    public ResponseEntity<?> getTasas() {
        if (ultimaActualizacion != null && 
            LocalDateTime.now().isBefore(ultimaActualizacion.plusHours(1))) {
            return ResponseEntity.ok(Map.of(
                "tasas", cache,
                "base", "COP",
                "actualizacion", ultimaActualizacion,
                "proximaActualizacion", ultimaActualizacion.plusHours(1)
            ));
        }
        
        try {
            Map<?, ?> response = restTemplate.getForObject(
                "https://open.er-api.com/v6/latest/COP", 
                Map.class
            );
            
            if (response != null && response.containsKey("rates")) {
                Map<?, ?> rates = (Map<?, ?>) response.get("rates");
                cache.clear();
                
                List<String> divisas = List.of(
                    "USD", "EUR", "GBP", "BRL", "MXN", "ARS", "CLP", 
                    "PEN", "VES", "CAD", "JPY", "CNY", "KRW"
                );
                
                divisas.forEach(divisa -> {
                    if (rates.containsKey(divisa)) {
                        cache.put(divisa, new TasaDivisa(
                            divisa, 
                            Double.parseDouble(rates.get(divisa).toString()),
                            LocalDateTime.now()
                        ));
                    }
                });
                
                cache.put("COP", new TasaDivisa("COP", 1.0, LocalDateTime.now()));
                ultimaActualizacion = LocalDateTime.now();
                
                return ResponseEntity.ok(Map.of(
                    "tasas", cache,
                    "base", "COP",
                    "actualizacion", ultimaActualizacion,
                    "proximaActualizacion", ultimaActualizacion.plusHours(1)
                ));
            }
        } catch (Exception e) {
            // Fallback logging
        }
        
        // Fallback
        return ResponseEntity.ok(Map.of(
            "tasas", getTasasFallback(),
            "base", "COP",
            "fuente", "fallback"
        ));
    }

    @GetMapping("/conversion")
    public ResponseEntity<Map<String, Object>> getConversion(
            @RequestParam(defaultValue = "COP") String desde,
            @RequestParam String hacia) {
        
        double rate = 1.0;
        String haciaUpper = hacia.toUpperCase();
        
        // Try getting from cache first
        if (cache.containsKey(haciaUpper)) {
            rate = cache.get(haciaUpper).getTasa();
        } else {
            // If cache empty or key missing, get fallback
            Map<String, TasaDivisa> fallback = getTasasFallback();
            if (fallback.containsKey(haciaUpper)) {
                rate = fallback.get(haciaUpper).getTasa();
            }
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
    
    private Map<String, TasaDivisa> getTasasFallback() {
        Map<String, TasaDivisa> fallback = new java.util.HashMap<>();
        fallback.put("USD", new TasaDivisa("USD", 0.000245, null));
        fallback.put("EUR", new TasaDivisa("EUR", 0.000226, null));
        fallback.put("GBP", new TasaDivisa("GBP", 0.000194, null));
        fallback.put("BRL", new TasaDivisa("BRL", 0.00138, null));
        fallback.put("MXN", new TasaDivisa("MXN", 0.00481, null));
        fallback.put("CLP", new TasaDivisa("CLP", 0.230, null));
        fallback.put("PEN", new TasaDivisa("PEN", 0.00092, null));
        fallback.put("ARS", new TasaDivisa("ARS", 0.222, null));
        fallback.put("CAD", new TasaDivisa("CAD", 0.000335, null));
        fallback.put("JPY", new TasaDivisa("JPY", 0.0382, null));
        fallback.put("CNY", new TasaDivisa("CNY", 0.00178, null));
        fallback.put("COP", new TasaDivisa("COP", 1.0, null));
        return fallback;
    }
}

