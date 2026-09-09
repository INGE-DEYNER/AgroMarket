package com.agromarket.domain.services.currency;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ExchangeRateService {

    private static final String PROVIDER_URL = "https://api.frankfurter.dev/v1/latest";
    private static final String BASE_CURRENCY = "COP";
    private static final List<String> SUPPORTED_CURRENCIES = List.of(
            "USD", "EUR", "GBP", "BRL", "MXN", "CLP", "JPY", "CNY", "PEN", "ARS", "CAD"
    );
    private static final Duration CACHE_DURATION = Duration.ofHours(1);

    private final RestClient restClient;

    private volatile Map<String, Double> cachedRates;
    private volatile Instant cachedAt;

    public ExchangeRateService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public synchronized Map<String, Double> getRates() {
        if (cachedRates != null
                && cachedAt != null
                && Duration.between(cachedAt, Instant.now()).compareTo(CACHE_DURATION) < 0) {
            return new LinkedHashMap<>(cachedRates);
        }

        try {
            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("api.frankfurter.dev")
                            .path("/v1/latest")
                            .queryParam("base", BASE_CURRENCY)
                            .queryParam("symbols", String.join(",", SUPPORTED_CURRENCIES))
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (response == null || !(response.get("rates") instanceof Map<?, ?> providerRates)) {
                throw new IllegalStateException("El proveedor de divisas no devolvió tasas válidas.");
            }

            Map<String, Double> rates = new LinkedHashMap<>();
            rates.put(BASE_CURRENCY, 1.0);

            // Frankfurter devuelve "1 COP = X moneda extranjera".
            // AgroMarket necesita "1 moneda extranjera = X COP".
            for (String currency : SUPPORTED_CURRENCIES) {
                Object rawRate = providerRates.get(currency);

                if (!(rawRate instanceof Number number) || number.doubleValue() <= 0) {
                    throw new IllegalStateException(
                            "No existe una tasa válida para " + currency + ".");
                }

                rates.put(currency, 1.0 / number.doubleValue());
            }

            cachedRates = rates;
            cachedAt = Instant.now();

            return new LinkedHashMap<>(rates);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "No fue posible obtener las tasas de cambio actuales desde Frankfurter.",
                    exception);
        }
    }

    public synchronized void invalidateCache() {
        cachedRates = null;
        cachedAt = null;
    }
}
