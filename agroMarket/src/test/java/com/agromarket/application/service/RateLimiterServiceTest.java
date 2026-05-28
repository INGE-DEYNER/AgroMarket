package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.application.service.impl.InMemoryRateLimiterService;
import org.junit.jupiter.api.Test;

public class RateLimiterServiceTest {

    @Test
    public void inMemoryLimiter_allowsUpToMax_thenBlocks() {
        InMemoryRateLimiterService limiter = new InMemoryRateLimiterService();
        String key = "user-123";

        // default max is 3
        assertThat(limiter.tryAcquire(key)).isTrue();
        assertThat(limiter.tryAcquire(key)).isTrue();
        assertThat(limiter.tryAcquire(key)).isTrue();

        // fourth attempt should be blocked
        assertThat(limiter.tryAcquire(key)).isFalse();
    }
}
