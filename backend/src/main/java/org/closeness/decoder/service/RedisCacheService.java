package org.closeness.decoder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisCacheService {

    private final StringRedisTemplate redisTemplate;

    public String getFriendUrlFromCache(String key) {
        log.info("fetching cached friend url");
        return redisTemplate.opsForValue().get(key);
    }

    public void createFriendUrl(String key, String value) {
        log.info("creating cache for friend code with source url");
        redisTemplate.opsForValue().set(key, value,Duration.ofMinutes(60));
    }

    public Long createOrUpdateRateLimitKey(String key, int windowSeconds) {
        String redisKey = "ratelimit:" + key;

        Long count = redisTemplate.opsForValue().increment(redisKey);

        if (count != null && count == 1) {
            redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
        }
        return count;
    }

    public Long getTimeToReset(String key) {
        Long ttl = redisTemplate.getExpire("ratelimit:" + key);
        return ttl != null ? ttl : 0;
    }
}
