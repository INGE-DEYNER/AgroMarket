package com.agromarket.application.adapters.api.controllers.currency;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DivisaController — Tasas de cambio públicas para el frontend.
 *
 * El frontend (DivisaContext.jsx) llama a GET /api/divisas/tasas sin token.
 * Devuelve tasas de referencia COP-base para las divisas soportadas.
 * En producción esto se reemplazaría por un proveedor real (e.g. Open Exchange Rates).
 */
@RestController
@RequestMapping("/api/divisas")
public class DivisaController {

    /**
     * Tasas de cambio aproximadas con base en COP (1 COP = X unidades de otra divisa).
     * Los valores son inversos: cuántos COP equivalen a 1 unidad de la divisa extranjera.
     */
    @GetMapping("/tasas")
    public Map<String, Object> getTasas() {
        Map<String, Object> response = new LinkedHashMap<>();

        // Tasas de COP por 1 unidad de moneda extranjera (aproximadas)
        Map<String, Double> tasas = new LinkedHashMap<>();
        tasas.put("COP",  1.0);
        tasas.put("USD",  4200.0);   // 1 USD ≈ 4200 COP
        tasas.put("EUR",  4600.0);   // 1 EUR ≈ 4600 COP
        tasas.put("GBP",  5300.0);   // 1 GBP ≈ 5300 COP
        tasas.put("BRL",  820.0);    // 1 BRL ≈ 820 COP
        tasas.put("MXN",  230.0);    // 1 MXN ≈ 230 COP
        tasas.put("CLP",  4.5);      // 1 CLP ≈ 4.5 COP
        tasas.put("JPY",  28.0);     // 1 JPY ≈ 28 COP
        tasas.put("CNY",  580.0);    // 1 CNY ≈ 580 COP
        tasas.put("PEN",  1120.0);   // 1 PEN ≈ 1120 COP
        tasas.put("ARS",  4.8);      // 1 ARS ≈ 4.8 COP
        tasas.put("CAD",  3100.0);   // 1 CAD ≈ 3100 COP

        response.put("base", "COP");
        response.put("tasas", tasas);
        response.put("actualizadoEn", Instant.now().toString());
        response.put("fuente", "agromarket-static-dev");

        return response;
    }
}
