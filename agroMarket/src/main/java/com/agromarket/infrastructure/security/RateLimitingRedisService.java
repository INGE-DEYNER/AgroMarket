package com.agromarket.infrastructure.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class RateLimitingRedisService {

    private final StringRedisTemplate redisTemplate;

    public RateLimitingRedisService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String key, int limit, long durationInSeconds) {
        String redisKey = "rate_limit:" + key;
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count == null) {
            return true;
        }
        if (count == 1) {
            redisTemplate.expire(redisKey, Duration.ofSeconds(durationInSeconds));
        }
        return count <= limit;
    }
}
