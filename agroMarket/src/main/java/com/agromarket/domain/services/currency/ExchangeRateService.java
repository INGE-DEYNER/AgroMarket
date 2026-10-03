package com.agromarket.application.services.currency;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ExchangeRateService {

    private static final Logger logger = LoggerFactory.getLogger(ExchangeRateService.class);

    /*
     * PROVEEDOR DE TASAS
     *
     * Antes se consultaba api.frankfurter.dev/v1/latest?base=COP. Frankfurter
     * publica únicamente las divisas del BCE y NO incluye COP, así que esa
     * llamada devolvía HTTP 404 y el endpoint GET /divisas/tasas respondía 500.
     *
     * open.er-api.com (acceso abierto de exchangerate-api.com) sí acepta
     * base=COP sin API key y devuelve el mapa completo de divisas.
     */
    private static final String PROVIDER_HOST = "open.er-api.com";
    private static final String PROVIDER_SOURCE = "ExchangeRate-API (open access)";
    private static final String FALLBACK_SOURCE = "tasas de respaldo locales";

    private static final String BASE_CURRENCY = "COP";
    private static final List<String> SUPPORTED_CURRENCIES = List.of(
            "USD", "EUR", "GBP", "BRL", "MXN", "CLP", "JPY", "CNY", "PEN", "ARS", "CAD"
    );
    private static final Duration CACHE_DURATION = Duration.ofHours(1);

    /**
     * Tasas de respaldo (1 unidad extranjera = N COP). Se devuelven solo si el
     * proveedor externo no responde, para que el endpoint NUNCA responda 500 y
     * el frontend siempre pueda convertir precios. Deben mantenerse alineadas
     * con TASAS_RESPALDO de frontend/src/app/providers/DivisaContext.jsx.
     */
    private static final Map<String, Double> FALLBACK_RATES = Map.ofEntries(
            Map.entry("COP", 1.0),
            Map.entry("USD", 4150.0),
            Map.entry("EUR", 4520.0),
            Map.entry("GBP", 5280.0),
            Map.entry("BRL", 780.0),
            Map.entry("MXN", 245.0),
            Map.entry("CLP", 4.8),
            Map.entry("JPY", 27.8),
            Map.entry("CNY", 575.0),
            Map.entry("PEN", 1130.0),
            Map.entry("ARS", 4.5),
            Map.entry("CAD", 3050.0)
    );

    private final RestClient restClient;

    private volatile Map<String, Double> cachedRates;
    private volatile Instant cachedAt;
    private volatile String source = FALLBACK_SOURCE;

    public ExchangeRateService(RestClient.Builder restClientBuilder) {
        // Timeouts explícitos: sin ellos, un proveedor lento bloquea el hilo de
        // la petición hasta el timeout del servidor y el cliente ve un error.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = restClientBuilder
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Tasas de cambio expresadas como "1 unidad de la divisa = N COP",
     * incluyendo siempre COP = 1.0 como base.
     *
     * No lanza excepciones: si el proveedor falla devuelve la última caché
     * válida o las tasas de respaldo, de modo que el endpoint público
     * /divisas/tasas nunca responde 500.
     */
    public synchronized Map<String, Double> getRates() {
        if (isCacheValid()) {
            return new LinkedHashMap<>(cachedRates);
        }

        try {
            Map<String, Double> rates = fetchProviderRates();

            cachedRates = rates;
            cachedAt = Instant.now();
            source = PROVIDER_SOURCE;

            return new LinkedHashMap<>(rates);
        } catch (Exception exception) {
            logger.warn(
                    "No fue posible obtener las tasas de cambio desde {}: {}. Se usan tasas de respaldo.",
                    PROVIDER_HOST,
                    exception.getMessage());

            if (cachedRates != null) {
                source = PROVIDER_SOURCE + " (caché)";
                return new LinkedHashMap<>(cachedRates);
            }

            source = FALLBACK_SOURCE;
            return new LinkedHashMap<>(FALLBACK_RATES);
        }
    }

    /**
     * Origen de las tasas devueltas por la última llamada a {@link #getRates()}.
     * Permite diagnosticar desde la respuesta si las tasas son reales o de
     * respaldo.
     */
    public String getSource() {
        return source;
    }

    private Map<String, Double> fetchProviderRates() {
        Map<?, ?> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host(PROVIDER_HOST)
                        .path("/v6/latest/{base}")
                        .build(BASE_CURRENCY))
                .retrieve()
                .body(Map.class);

        if (response == null
                || !"success".equals(response.get("result"))
                || !(response.get("rates") instanceof Map<?, ?> providerRates)) {
            throw new IllegalStateException("El proveedor de divisas no devolvió tasas válidas.");
        }

        Map<String, Double> rates = new LinkedHashMap<>();
        rates.put(BASE_CURRENCY, 1.0);

        // El proveedor devuelve "1 COP = X moneda extranjera".
        // AgroMarket necesita "1 moneda extranjera = X COP" (se invierte).
        for (String currency : SUPPORTED_CURRENCIES) {
            Object rawRate = providerRates.get(currency);

            if (!(rawRate instanceof Number number) || number.doubleValue() <= 0) {
                throw new IllegalStateException(
                        "No existe una tasa válida para " + currency + ".");
            }

            rates.put(currency, 1.0 / number.doubleValue());
        }

        return rates;
    }

    public synchronized void invalidateCache() {
        cachedRates = null;
        cachedAt = null;
    }

    private boolean isCacheValid() {
        return cachedRates != null
                && cachedAt != null
                && Duration.between(cachedAt, Instant.now()).compareTo(CACHE_DURATION) < 0;
    }
}
