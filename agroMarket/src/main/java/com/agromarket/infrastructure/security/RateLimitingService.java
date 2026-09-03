package com.agromarket.infrastructure.security;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

@Service
public class RateLimitingService {

    private final Cache<String, AtomicInteger> requests;

    private final int maxRequests;

    public RateLimitingService() {

        this.maxRequests = 10000;

        this.requests = Caffeine.newBuilder()
                .maximumSize(100_000)
                .expireAfterWrite(
                        Duration.ofMinutes(1))
                .build();
    }

    public boolean isAllowed(
            String clientKey) {

        AtomicInteger counter = requests.get(
                clientKey,
                key -> new AtomicInteger());

        return counter.incrementAndGet() <= maxRequests;
    }

    public int remaining(
            String clientKey) {

        AtomicInteger counter = requests.getIfPresent(clientKey);

        if (counter == null) {
            return maxRequests;
        }

        return Math.max(
                0,
                maxRequests - counter.get());
    }
}