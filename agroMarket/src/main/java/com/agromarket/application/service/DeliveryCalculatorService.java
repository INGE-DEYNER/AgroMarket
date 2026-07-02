package com.agromarket.application.service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class DeliveryCalculatorService {
    private static final Map<String, Integer> diasPorCiudad = Map.ofEntries(
        Map.entry("chigorodo", 1), Map.entry("apartado", 1), Map.entry("turbo", 1), Map.entry("carepa", 1),
        Map.entry("medellin", 2), Map.entry("bello", 2), Map.entry("itagui", 2), Map.entry("envigado", 2),
        Map.entry("bogota", 3), Map.entry("cali", 3), Map.entry("barranquilla", 3), Map.entry("cartagena", 3),
        Map.entry("bucaramanga", 4), Map.entry("cucuta", 4), Map.entry("pasto", 4), Map.entry("manizales", 3)
    );

    public int calcularDias(String ciudadDestino) {
        if (ciudadDestino == null || ciudadDestino.isBlank()) {
            return 4;
        }
        String clean = ciudadDestino.toLowerCase()
                                    .trim()
                                    .replace("á", "a")
                                    .replace("é", "e")
                                    .replace("í", "i")
                                    .replace("ó", "o")
                                    .replace("ú", "u");
        return diasPorCiudad.getOrDefault(clean, 4);
    }
}
