package com.agromarket.application.adapters.api.controllers.diagnostic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class BackendDiagnosticController {

    @Autowired
    private Environment env;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** Diagnóstico interno del backend (DB, perfil, etc.) */
    @GetMapping("/diagnostic")
    public Map<String, Object> runDiagnostic() {
        Map<String, Object> result = new HashMap<>();
        boolean ok = true;

        result.put("application", "AgroMarket Backend");
        result.put("profile", env.getProperty("spring.profiles.active", "default"));

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            result.put("database", "OK (MySQL Connected)");
        } catch (Exception e) {
            result.put("database", "FAIL: " + e.getMessage());
            ok = false;
        }

        result.put("status", ok ? "BACKEND CONECTADO A LA BASE DE DATOS Y LISTO PARA TESTEO" : "BACKEND REQUIERE ATENCION");
        result.put("ok", ok);

        return result;
    }

    /**
     * Métricas públicas de la plataforma.
     * Usado por Home.jsx y SobreAsafrut.jsx sin autenticación.
     */
    @GetMapping("/metrics")
    public Map<String, Object> getPublicMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        try {
            Long totalProductos = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM products WHERE active = true", Long.class);
            metrics.put("totalProductos", totalProductos != null ? totalProductos : 0);
        } catch (Exception e) {
            metrics.put("totalProductos", 0);
        }

        try {
            Long totalProductores = jdbcTemplate.queryForObject(
                    "SELECT COUNT(DISTINCT producer_id) FROM products WHERE active = true AND producer_id IS NOT NULL",
                    Long.class);
            metrics.put("totalProductores", totalProductores != null ? totalProductores : 0);
        } catch (Exception e) {
            metrics.put("totalProductores", 0);
        }

        try {
            Double avg = jdbcTemplate.queryForObject(
                    "SELECT AVG(price) FROM products WHERE active = true", Double.class);
            if (avg != null && avg > 0) {
                metrics.put("precioPromedio", String.format("$%,.0f", avg));
            } else {
                metrics.put("precioPromedio", "$0");
            }
        } catch (Exception e) {
            metrics.put("precioPromedio", "$0");
        }

        try {
            Double avgRating = jdbcTemplate.queryForObject(
                    "SELECT AVG(rating) FROM reviews", Double.class);
            if (avgRating != null && avgRating > 0) {
                metrics.put("calificacion", String.format("%.1f★", avgRating));
            } else {
                metrics.put("calificacion", "5.0★");
            }
        } catch (Exception e) {
            metrics.put("calificacion", "5.0★");
        }

        return metrics;
    }

    /**
     * Lista de productores públicos.
     * Usado por Productores.jsx y DashboardComprador.jsx sin autenticación.
     */
    @GetMapping("/productores")
    public List<Map<String, Object>> getPublicProductores() {
        return jdbcTemplate.queryForList(
            "SELECT u.id, u.first_name as firstName, u.last_name as lastName, " +
            "u.company_name as companyName, u.average_rating as averageRating " +
            "FROM users u WHERE u.role = 'PRODUCTOR' AND u.enabled = true " +
            "ORDER BY u.average_rating DESC NULLS LAST, u.created_at ASC"
        );
    }

    /**
     * Chatbot público para soporte.
     * Usado por ChatbotSoporte.jsx sin autenticación.
     */
    @PostMapping("/chatbot")
    public Map<String, Object> chatbotSupport(@RequestBody Map<String, String> request) {
        String mensaje = request.getOrDefault("mensaje", "");
        
        Map<String, Object> response = new HashMap<>();
        String respuesta;
        
        // Simple chatbot logic based on message content
        if (mensaje.toLowerCase().contains("ayuda") || mensaje.toLowerCase().contains("soporte")) {
            respuesta = "Estoy aquí para ayudarte. ¿En qué puedo asistirte con AgroMarket?";
        } else if (mensaje.toLowerCase().contains("producto") || mensaje.toLowerCase().contains("compra")) {
            respuesta = "Puedes explorar nuestros productos en el catálogo o contactar directamente a los productores.";
        } else if (mensaje.toLowerCase().contains("precio") || mensaje.toLowerCase().contains("costo")) {
            respuesta = "Los precios varían según el productor y la temporada. Revisa el catálogo para ver los precios actuales.";
        } else if (mensaje.toLowerCase().contains("hola") || mensaje.toLowerCase().contains("hi")) {
            respuesta = "¡Hola! Bienvenido a AgroMarket. ¿Cómo puedo ayudarte hoy?";
        } else if (mensaje.isBlank()) {
            respuesta = "Por favor ingresa un mensaje.";
        } else {
            respuesta = "Gracias por contactarnos. Un representante se pondrá en contacto contigo pronto.";
        }
        
        response.put("respuesta", respuesta);
        return response;
    }
}
