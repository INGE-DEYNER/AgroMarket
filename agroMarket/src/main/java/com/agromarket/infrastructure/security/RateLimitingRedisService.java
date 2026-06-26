package com.agromarket.infrastructure.security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitingRedisService {
    private final ConcurrentHashMap<String, AtomicLong> counters = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int limit, long durationInSeconds) {
        counters.putIfAbsent(key, new AtomicLong(0));
        long count = counters.get(key).incrementAndGet();
        return count <= limit;
    }
}
