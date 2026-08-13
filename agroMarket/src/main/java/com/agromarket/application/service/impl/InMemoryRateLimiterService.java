package com.agromarket.application.service.impl;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Service;

import com.agromarket.application.ports.in.RateLimiterService;

@Service
public class InMemoryRateLimiterService implements RateLimiterService {
    private final ConcurrentMap<String, Deque<Long>> map = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final long windowMs;

    public InMemoryRateLimiterService() {
        this.maxRequests = 3; // default 3 per window
        this.windowMs = 60 * 60 * 1000L; // 1 hour
    }

    @Override
    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        Deque<Long> deque = map.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            // purge old
            while (!deque.isEmpty() && deque.peekFirst() < now - windowMs) {
                deque.pollFirst();
            }
            if (deque.size() < maxRequests) {
                deque.offerLast(now);
                return true;
            }
            return false;
        }
    }
}
