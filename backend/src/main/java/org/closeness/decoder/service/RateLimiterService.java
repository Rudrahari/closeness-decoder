package org.closeness.decoder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RedisCacheService redisCacheService;

    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        Long count = redisCacheService.createOrUpdateRateLimitKey(key, windowSeconds);
        return count != null && count <= maxRequests;
    }

    public long getTimeToReset(String key) {
        Long ttl = redisCacheService.getTimeToReset(key);
        return ttl != null ? ttl : 0;
    }
}