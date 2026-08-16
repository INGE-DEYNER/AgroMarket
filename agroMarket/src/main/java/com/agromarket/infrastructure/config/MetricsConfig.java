
package com.agromarket.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics;

@Configuration
public class MetricsConfig {

    @Bean
    public JvmMemoryMetrics jvmMemoryMetrics(
            MeterRegistry meterRegistry) {

        JvmMemoryMetrics metrics = new JvmMemoryMetrics();

        metrics.bindTo(meterRegistry);

        return metrics;
    }

    @Bean
    public JvmThreadMetrics jvmThreadMetrics(
            MeterRegistry meterRegistry) {

        JvmThreadMetrics metrics = new JvmThreadMetrics();

        metrics.bindTo(meterRegistry);

        return metrics;
    }
}