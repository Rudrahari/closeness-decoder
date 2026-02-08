package org.closeness.decoder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        String redisKey = "ratelimit:" + key;

        Long count = redisTemplate.opsForValue().increment(redisKey);

        if (count != null && count == 1) {
            redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
        }

        return count != null && count <= maxRequests;
    }

    public long getTimeToReset(String key) {
        Long ttl = redisTemplate.getExpire("ratelimit:" + key);
        return ttl != null ? ttl : 0;
    }
}