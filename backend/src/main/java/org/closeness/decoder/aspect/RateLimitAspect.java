package org.closeness.decoder.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.closeness.decoder.annotation.RateLimiter;
import org.closeness.decoder.exception.RateLimitExceededException;
import org.closeness.decoder.service.RateLimiterService;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {
    
    private final RateLimiterService rateLimiterService;

    @Around("@annotation(rateLimit)")
    public Object checkRateLimit(ProceedingJoinPoint joinPoint, RateLimiter rateLimit) throws Throwable {
        
        String clientKey = getClientKey(rateLimit.key());
        
        if (!rateLimiterService.isAllowed(clientKey, rateLimit.requests(), rateLimit.window())) {
            long retryAfter = rateLimiterService.getTimeToReset(clientKey);
            throw new RateLimitExceededException(retryAfter);
        }
        
        return joinPoint.proceed();
    }
    
    private String getClientKey(String customKey) {
        HttpServletRequest request = ((ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes()).getRequest();
        
        String ip = request.getRemoteAddr();
        String path = request.getRequestURI();
        
        if (customKey != null && !customKey.isEmpty()) {
            return customKey + ":" + ip;
        }
        
        return path + ":" + ip;
    }
}